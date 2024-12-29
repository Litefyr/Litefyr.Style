<?php

namespace Litefyr\Style\Service;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\Flow\Annotations as Flow;
use Neos\Utility\Files;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use function sprintf;

#[Flow\Scope('singleton')]
class CodePenService
{
    const DIRECTORY = 'CodePenStorage';
    const PROPERTIES = ['themeScrollIndicatorMarkup', 'themeLogoData', 'themeLogoDataContent'];
    const MARKUP_PROPERTY = 'html';

    protected string $directory;

    /**
     * @var string[]
     */
    #[Flow\InjectConfiguration('codepenProperties.cliCommandAfterPublishToLive')]
    protected $cliCommandAfterPublishToLive;

    /**
     * Set up directory
     *
     * @return void
     */
    public function initializeObject(): void
    {
        // @phpstan-ignore-next-line
        $this->directory = Files::concatenatePaths([FLOW_PATH_DATA, self::DIRECTORY]);
    }

    /**
     * Action if a node is published. It calls a cli command to make the whole process async
     *
     * @param NodeInterface $node
     * @param Workspace $targetWorkspace
     * @return void
     */
    public function afterNodePublishing(NodeInterface $node, Workspace $targetWorkspace): void
    {
        if (!$targetWorkspace->isPublicWorkspace() || !$this->hasCorrectNodeType($node)) {
            return;
        }

        if ($node->isRemoved()) {
            $filename = $this->getNodeVariantFileName($node);
            $this->flush($filename);
            $this->runCliCommandAfterPublishToLive();
            return;
        }

        $markup = $this->getMarkup($node);
        // Make task aysnc
        $this->runCliCommand(
            sprintf(
                'php flow style:codepen --identifier=%s --markup=%s',
                $node->getIdentifier(),
                base64_encode($markup)
            )
        );
    }

    /**
     * Process single node
     *
     * @param NodeInterface $node
     * @param string|null $markup
     */
    public function processSingleNode(NodeInterface $node, ?string $markup = null): void
    {
        $filename = $this->getNodeVariantFileName($node);
        $this->writeFile($filename, $markup ?? '');
        $this->runCliCommandAfterPublishToLive();
    }

    /**
     * Process nodes
     *
     * @param NodeInterface[] $nodes
     */
    public function processNodes(array $nodes): void
    {
        foreach ($nodes as $node) {
            $nodeVariants = [$node, ...$node->getOtherNodeVariants()];
            /** @var NodeInterface $nodeVariant */
            foreach ($nodeVariants as $nodeVariant) {
                $markup = $this->getMarkup($nodeVariant);
                $filename = $this->getNodeVariantFileName($nodeVariant);
                $this->writeFile($filename, $markup);
            }
        }

        $this->runCliCommandAfterPublishToLive();
    }

    /**
     * Flush files from the directory
     *
     * @param string|null $file If filename is given flush single file, otherwise flush all files
     * @param boolean|null $skipCLI If true, the cli command will not be executed
     * @return void
     */
    public function flush(?string $file = null, ?bool $skipCLI = null): void
    {
        if (!$file) {
            $this->deleteDirectory($this->directory);
            if (!$skipCLI) {
                $this->runCliCommandAfterPublishToLive();
            }
            return;
        }

        if (!file_exists($file)) {
            return;
        }

        $file = new SplFileInfo($file);
        if ($file->isDir()) {
            rmdir($file);
        } else {
            unlink($file);
        }

        if (!$skipCLI) {
            $this->runCliCommandAfterPublishToLive();
        }
    }

    /**
     * Check if node has correct node type
     *
     * @param NodeInterface $node
     * @return boolean
     */
    protected function hasCorrectNodeType(NodeInterface $node): bool
    {
        $nodeType = $node->getNodeType();
        return $nodeType->isOfType('Litefyr.Style:Mixin.Visuals.Logo') ||
            $nodeType->isOfType('Litefyr.Style:Mixin.ScollIndicator');
    }

    /**
     * Delete directory
     *
     * @param string $dirPath
     * @return void
     */
    protected function deleteDirectory(string $dirPath)
    {
        if (!file_exists($dirPath)) {
            return;
        }
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dirPath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($iterator as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }
        rmdir($dirPath);
    }

    /**
     * Run cli command
     *
     * @param string|string[]|null $command
     * @return boolean Returns true if the command was executed
     */
    protected function runCliCommand($command = null): bool
    {
        if (!isset($command)) {
            return false;
        }
        if (is_string($command)) {
            $command = [$command];
        }
        if (is_array($command) && count($command)) {
            foreach ($command as $commandItem) {
                if (!$commandItem || !is_string($commandItem)) {
                    continue;
                }
                // @phpstan-ignore-next-line
                exec(sprintf('cd %s && %s', FLOW_PATH_ROOT, $commandItem));
            }
            return true;
        }
        return false;
    }

    /**
     * Run cli command after publish to live
     *
     * @return void
     */
    protected function runCliCommandAfterPublishToLive(): void
    {
        $command = $this->cliCommandAfterPublishToLive;
        $this->runCliCommand($command);
        $this->updateInfoFile();
    }

    /**
     * Upate file with info about the last update
     */
    protected function updateInfoFile(): void
    {
        $this->writeFile($this->directory . '/_LastUpdate.txt', date('Y-m-d H:i:s', time()));
    }

    /**
     * Write file
     *
     * @param string $filename
     * @param string $content
     * @return void
     */
    protected function writeFile(string $filename, string $content): void
    {
        if (!$filename) {
            return;
        }
        try {
            $file = fopen($filename, 'w');
            if (!$file) {
                return;
            }
            fwrite($file, $content);
            fclose($file);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    /**
     * Get markup from node
     *
     * @param NodeInterface $node
     * @return string
     */
    protected function getMarkup(NodeInterface $node): string
    {
        $markup = '';
        foreach (self::PROPERTIES as $property) {
            $data = $node->getProperty($property);
            if (isset($data[self::MARKUP_PROPERTY])) {
                $markup .= $data[self::MARKUP_PROPERTY];
            }
        }
        return $markup;
    }

    /**
     * Get nested directory and filename, create if not exists
     *
     * @param string $filename
     * @return string
     */
    protected function getNestedDirectory(string $filename): string
    {
        $filename = str_replace('-', '/', $filename);
        $filePathAndName = sprintf('%s/%s', $this->directory, $filename);
        if (!file_exists(dirname($filePathAndName))) {
            Files::createDirectoryRecursively(dirname($filePathAndName));
        }
        return $filePathAndName;
    }

    /**
     * Get the file name for a node variant
     *
     * @param NodeInterface $nodeVariant
     * @return string
     */
    protected function getNodeVariantFileName(NodeInterface $nodeVariant): string
    {
        $nodeDimensionVariants = [];
        foreach ($nodeVariant->getDimensions() as $key => $dimension) {
            $nodeDimensionVariants[] = $key . '-' . implode('-', $dimension);
        }
        $identifier = $nodeVariant->getIdentifier();
        $dimensionString = implode('_', $nodeDimensionVariants);
        $dimensionString = $dimensionString ? '_' . $dimensionString : '';
        $filename = sprintf('%s%s.html', $identifier, $dimensionString);

        return $this->getNestedDirectory($filename);
    }
}
