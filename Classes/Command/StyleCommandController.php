<?php

namespace Litespeed\Style\Command;

use Litespeed\Integration\Http\CommandHttpRequestHandler;
use Neos\Flow\Core\Bootstrap;
use Litespeed\Style\Service\CssService;
use Litespeed\Style\Service\CodePenService;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\ContentDimensionCombinator;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\Eel\Exception as EelException;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Cli\Exception\StopCommandException;
use Neos\Neos\Domain\Service\SiteService;

#[Flow\Scope('singleton')]
class StyleCommandController extends CommandController
{
    #[Flow\Inject]
    protected Bootstrap $bootstrap;

    #[Flow\Inject]
    protected CssService $cssService;

    #[Flow\Inject]
    protected CodePenService $codePenService;

    #[Flow\Inject]
    protected ContextFactoryInterface $contextFactory;

    #[Flow\Inject]
    protected ContentDimensionCombinator $dimensionCombinator;

    #[Flow\Inject]
    protected WorkspaceRepository $workspaceRepository;

    /**
     * Generate CSS for all sites
     *
     * This generates the CSS values for the theme style package for all sites.
     *
     * @param string $workspace Workspace name, default is 'live'
     * @return void
     * @throws EelException
     * @throws StopCommandException
     */
    public function CSSCommand(string $workspace = 'live'): void
    {
        $sites = $this->getSiteNodes($workspace);

        foreach ($sites as $site) {
            $name = $site->getName();
            $css = $this->cssService->generateCss($site);
            if ($css) {
                $this->outputLine(
                    '<comment> Generated CSS for site "%s" </comment>',
                    [$name]
                );
                $this->outputLine($css);
            } else {
                $this->outputLine(
                    '<error> No CSS generated for site "%s" </error>',
                    [$name]
                );
            }
            $this->outputLine();
        }

        $this->outputLine('<success> Done </success>');
    }

    /**
     * Save instances from CodePen property into the temporary directory
     *
     * This generates a temporary file for each CodePen property in the Litespeed.Style package.
     *
     * @param string|null $identifier If set, only this node get processed, add multiple nodes seperates with comma
     * @param string|null $markup Need identifier also to be set. If set, this markup will be used instead of the node markup. Need to be base64 encoded. Used internaly to make some task asychronus
     * @return void
     */
    public function codepenCommand(
        ?string $identifier = null,
        ?string $markup = null
    ): void {
        if (isset($markup)) {
            if (!isset($identifier)) {
                $this->outputLine(
                    '<error> Please set also the identifier </error>'
                );
                $this->quit(1);
            }

            if (str_contains($identifier, ',')) {
                $this->outputLine(
                    '<error> If markup is set, only one identifier is allowed </error>'
                );
                $this->quit(1);
            }

            $this->outputLine(
                '<comment> Get Node with identifier "%s"... </comment>',
                [$identifier]
            );

            $sites = $this->getSiteNodes('live');
            $node = $this->findNodes($sites, $identifier, true);

            if (!$node) {
                $this->outputLine(
                    '<error> Node with identifier "%s" not found </error>',
                    [$identifier]
                );
                $this->quit(1);
            }

            $markup = base64_decode($markup);
            $this->codePenService->processSingleNode($node, $markup);
            return;
        }

        $this->outputLine('<comment> Get all site nodes... </comment>');
        $sites = $this->getSiteNodes('live');
        if (!isset($identifier)) {
            $this->codePenService->flush(null, true);
            $this->codePenService->processNodes($sites);
            $this->outputLine(
                '<success> Saved all instances of the CodePen box into the temporary directory </success>'
            );
            return;
        }

        $nodes = $this->findNodes($sites, $identifier, false);

        if (!count($nodes)) {
            $this->outputLine(
                '<error> No node with identifier "%s" found </error>',
                [$identifier]
            );
            $this->quit(1);
        }

        $this->codePenService->processNodes($nodes);
        $this->outputLine(
            '<success> Saved instance for node "%s" of the CodePen box into the temporary directory </success>',
            [$identifier]
        );
    }

    /**
     * Find nodes by identifier
     *
     * @param array $siteNodes
     * @param string $identifier
     * @param boolean $singleNode
     * @return mixed
     */
    private function findNodes(
        array $siteNodes,
        string $identifier,
        bool $singleNode = false
    ) {
        $nodes = [];
        $identifiers = explode(',', $identifier);
        foreach ($siteNodes as $site) {
            $siteIdentifier = $site->getIdentifier();
            if (in_array($siteIdentifier, $identifiers)) {
                if ($singleNode) {
                    return $site;
                }
                $nodes[] = $site;
            }
        }

        $flowQuery = new FlowQuery($siteNodes);
        foreach ($identifiers as $id) {
            $findNodes = $flowQuery->find('#' . $id)->get();
            if (!count($findNodes)) {
                continue;
            }
            if ($singleNode) {
                return $findNodes[0];
            }
            $nodes = array_merge($nodes, $findNodes);
        }

        return array_filter(array_unique($nodes));
    }

    /**
     * Get site nodes
     *
     * @param string $workspace
     * @return array
     */
    private function getSiteNodes(string $workspace = 'live'): array
    {
        $requestHandler = new CommandHttpRequestHandler($this->bootstrap);
        $this->bootstrap->setActiveRequestHandler($requestHandler);

        $this->outputLine();
        /** @noinspection PhpUndefinedMethodInspection */
        if ($this->workspaceRepository->countByName($workspace) === 0) {
            $this->outputLine(
                '<error> Workspace "%s" does not exist </error>',
                [$workspace]
            );
            $this->quit();
        }

        $contextProperties = [
            'workspaceName' => $workspace,
            'dimensions' => [],
            'invisibleContentShown' => true,
            'inaccessibleContentShown' => true,
        ];
        $baseContext = $this->contextFactory->create($contextProperties);
        $baseContextSitesNode = $baseContext->getNode(
            SiteService::SITES_ROOT_PATH
        );
        if (!$baseContextSitesNode) {
            $this->outputLine(
                sprintf(
                    '<error> Could not find "%s" root node </error>',
                    SiteService::SITES_ROOT_PATH
                )
            );
            $this->quit();
        }
        $baseContextSiteNodes = $baseContextSitesNode->getChildNodes();
        if ($baseContextSiteNodes === []) {
            $this->outputLine(
                sprintf(
                    '<error> Could not find any site nodes in "%s" root node </error>',
                    SiteService::SITES_ROOT_PATH
                )
            );
            $this->quit();
        }
        $sites = [];
        foreach (
            $this->dimensionCombinator->getAllAllowedCombinations()
            as $dimensionCombination
        ) {
            $flowQuery = new FlowQuery($baseContextSiteNodes);
            $siteNodes = $flowQuery
                ->context([
                    'dimensions' => $dimensionCombination,
                    'targetDimensions' => [],
                ])
                ->get();
            $sites = array_merge($sites, $siteNodes);
        }

        return $sites;
    }
}
