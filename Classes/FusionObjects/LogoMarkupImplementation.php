<?php

namespace Litefyr\Style\FusionObjects;

use Garagist\ContentBox\FusionService\Service\FusionService;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Fusion\Exception;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

/**
 * Renderer LogoMarkup Fusion Object
 */
class LogoMarkupImplementation extends AbstractFusionObject
{
    #[Flow\Inject]
    protected FusionService $fusionService;

    public function getContent(): string
    {
        return (string) $this->fusionValue('content');
    }

    /**
     * @return array<string, NodeInterface>
     */
    public function getContextNodes(): array
    {
        return $this->fusionValue('contextNodes');
    }

    /**
     * Render $type and return it.
     *
     * @return string
     */
    public function evaluate(): string
    {
        $content = $this->getContent();
        $contextNodes = $this->getContextNodes();

        try {
            return $this->fusionService->render($contextNodes, $content);
        } catch (Exception $e) {
            return $this->fusionService->renderException($e);
        }
    }
}
