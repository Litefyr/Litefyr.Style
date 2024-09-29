<?php

namespace Litefyr\Style\FusionObjects;

use Litefyr\Style\Service\FaviconService;
use Neos\ContentRepository\Domain\Projection\Content\TraversableNodeInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Media\Domain\Model\AssetInterface;

/**
 * Renderer Favicon Fusion Object
 */
class FaviconImplementation extends AbstractFusionObject
{
    #[Flow\Inject]
    protected FaviconService $faviconService;

    public function getAsset(): ?AssetInterface
    {
        return $this->fusionValue('asset');
    }

    public function getNode(): TraversableNodeInterface
    {
        return $this->fusionValue('node');
    }

    public function getType(): string
    {
        return $this->fusionValue('type');
    }

    public function getSize(): int
    {
        return $this->fusionValue('size');
    }

    /**
     *
     * @return string|null
     * @throws \Exception
     */
    public function evaluate(): ?string
    {
        $type = $this->getType();
        $size = $this->getSize();
        $node = $this->getNode();
        $nodeIdentifier = $node->getNodeAggregateIdentifier()->__toString();

        $fileContent = $this->faviconService->getSavedFavicon($nodeIdentifier, $size, $type);

        if ($fileContent) {
            return $fileContent;
        }

        $asset = $this->getAsset();
        if (!$asset) {
            return null;
        }

        return $this->faviconService->createFaviconFile($nodeIdentifier, $asset, $size, $type);
    }
}
