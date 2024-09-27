<?php

namespace Litefyr\Style\FusionObjects;

use GdImage;
use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\ThumbnailConfiguration;
use Neos\Media\Domain\Service\AssetService;

/**
 * Renderer Favicon Fusion Object
 */
class FaviconImplementation extends AbstractFusionObject
{
    #[Flow\Inject]
    protected AssetService $assetService;

    /**
     * Asset
     *
     * @return AssetInterface
     */
    public function getAsset()
    {
        return $this->fusionValue('asset');
    }

    /**
     * Get size of favicon
     *
     * @return int
     */
    public function getSize(): int
    {
        switch ($this->fusionValue('size')) {
            case 'small':
                return 16;
            case 'large':
                return 48;
        }
        return 32;
    }

    /**
     *
     * @return string
     * @throws \Exception
     */
    public function evaluate(): string
    {
        $asset = $this->getAsset();
        if (!$asset instanceof AssetInterface) {
            throw new \Exception('No asset given for rendering.', 1515184217);
        }

        return $this->getIcoFileContent($asset);
    }

    /**
     * Get ICO file content
     *
     * @param AssetInterface $asset
     * @return string|false
     */
    protected function getIcoFileContent(AssetInterface $asset)
    {
        $size = $this->getSize();

        $thumbnailConfiguration = new ThumbnailConfiguration($size, $size, $size, $size, true, true, true, 80, 'png');
        $request = $this->getRuntime()->getControllerContext()->getRequest();
        $thumbnailData = $this->assetService->getThumbnailUriAndSizeForAsset($asset, $thumbnailConfiguration, $request);
        if ($thumbnailData === null) {
            return '';
        }
        $inputFile = $thumbnailData['src'];

        // Load the PNG image
        $pngImage = imagecreatefrompng($inputFile);

        // Save the favicon.ico
        $content = $this->imageico($pngImage, $size);

        // Free memory
        imagedestroy($pngImage);

        return $content;
    }

    /**
     * Create ICO file content from PNG image
     *
     * @param resource|GdImage $image
     * @param int $size
     * @param int $quality
     * @param int $filters
     * @return string|false
     */
    protected function imageico($image, $size, $quality = 9, $filters = PNG_NO_FILTER)
    {
        // Collect PNG data.
        ob_start();
        imagesavealpha($image, true);
        imagepng($image, null, $quality, $filters);
        $pngData = ob_get_clean();
        // Write ICO header, image entry and PNG data.
        echo pack('v3', 0, 1, 1);
        echo pack('C4v2V2', $size, $size, 0, 0, 1, 32, strlen($pngData), 22);
        echo $pngData;

        return ob_get_clean();
    }
}
