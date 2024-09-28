<?php

namespace Litefyr\Style\Service;

use FilesystemIterator;
use GdImage;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\ThumbnailConfiguration;
use Neos\Media\Domain\Service\AssetService;
use Neos\Utility\Files;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use function sprintf;

#[Flow\Scope('singleton')]
class FaviconService
{
    protected string $temporaryDirectory = '';

    #[Flow\Inject]
    protected AssetService $assetService;

    public function initializeObject(): void
    {
        $this->prepareTemporaryDirectory();
    }

    public function getSavedFavicon(string $nodeIdentifier, int $size, string $type): ?string
    {
        $filename = $this->getFilename($nodeIdentifier, $size, $type);
        $content = $this->getFileContent($filename);

        if ($content === null) {
            return null;
        }

        return $content;
    }

    public function createFaviconFile(
        string $nodeIdentifier,
        AssetInterface $asset,
        int $size,
        string $type,
        ActionRequest $request
    ): ?string {
        $filename = $this->getFilename($nodeIdentifier, $size, $type);
        $thumbnail = $this->getThumbnail($asset, $size, $request);

        if ($type === 'png') {
            $content = file_get_contents($thumbnail);
        } else {
            $content = $this->createIcoFile($thumbnail, $size);
        }

        if (!$content) {
            return null;
        }

        $this->saveFile($filename, $content);
        return $content;
    }

    /**
     * Action if a node is published
     *
     * @param NodeInterface $node
     * @param Workspace $targetWorkspace
     * @return void
     */
    public function afterNodePublishing(NodeInterface $node, Workspace $targetWorkspace): void
    {
        if (!$targetWorkspace->isPublicWorkspace() || !$node->getNodeType()->isOfType('Litefyr.Style:Mixin.Favicon')) {
            return;
        }
        $this->flush();
    }

    public function flush(): void
    {
        if (!file_exists($this->temporaryDirectory)) {
            return;
        }

        $directory = new RecursiveDirectoryIterator($this->temporaryDirectory, FilesystemIterator::SKIP_DOTS);
        $fileIterator = new RecursiveIteratorIterator($directory, RecursiveIteratorIterator::CHILD_FIRST);

        /** @var SplFileInfo $file */
        foreach ($fileIterator as $file) {
            $file->isDir() ? rmdir($file) : unlink($file);
        }
    }

    protected function getThumbnail(AssetInterface $asset, int $size, ActionRequest $request): ?string
    {
        $thumbnailConfiguration = new ThumbnailConfiguration($size, $size, $size, $size, true, true, true, 80, 'png');
        $thumbnailData = $this->assetService->getThumbnailUriAndSizeForAsset($asset, $thumbnailConfiguration, $request);
        if ($thumbnailData === null || !isset($thumbnailData['src'])) {
            return null;
        }
        return $thumbnailData['src'];
    }

    protected function getFilename(string $nodeIdentifier, int $size, string $type): string
    {
        return sprintf('%s_%s.%s', $nodeIdentifier, $size, $type);
    }

    protected function getFileContent(string $fileName): ?string
    {
        if (!file_exists($this->temporaryDirectory . '/' . $fileName)) {
            return null;
        }
        return file_get_contents($this->temporaryDirectory . '/' . $fileName);
    }

    protected function saveFile(string $fileName, string $content): void
    {
        $file = fopen($this->temporaryDirectory . '/' . $fileName, 'w');
        fwrite($file, $content);
        fclose($file);
    }

    protected function prepareTemporaryDirectory(): void
    {
        $this->temporaryDirectory = Files::concatenatePaths([FLOW_PATH_DATA, 'Favicon']);
        if (!file_exists($this->temporaryDirectory)) {
            Files::createDirectoryRecursively($this->temporaryDirectory);
        }
    }

    protected function createIcoFile(string $inputFile, int $size): string
    {
        $pngImage = imagecreatefrompng($inputFile);

        if ($pngImage === false) {
            return '';
        }

        $content = $this->imageico($pngImage, $size);

        imagedestroy($pngImage);

        return $content;
    }

    /**
     * Create ICO file content from PNG image
     *
     * @param resource|GdImage $image
     * @param int $size
     * @return string|false
     */
    protected function imageico($image, $size)
    {
        $quality = 9;
        $filters = PNG_NO_FILTER;
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
