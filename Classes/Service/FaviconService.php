<?php

namespace Litefyr\Style\Service;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\ImageInterface;
use Neos\Media\Domain\Model\ThumbnailConfiguration;
use Neos\Media\Domain\Service\ThumbnailService;
use Neos\Utility\Files;
use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use function sprintf;

#[Flow\Scope('singleton')]
class FaviconService
{
    protected string $temporaryDirectory = '';

    #[Flow\Inject]
    protected ThumbnailService $thumbnailService;

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

    public function createFaviconFile(string $nodeIdentifier, AssetInterface $asset, int $size, string $type): ?string
    {
        $filename = $this->getFilename($nodeIdentifier, $size, $type);
        $content = $this->getThumbnailContent($asset, $size, $type);

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

    protected function getThumbnailContent(AssetInterface $asset, int $size, string $format): ?string
    {
        $thumbnailConfiguration = new ThumbnailConfiguration(
            $size,
            $size,
            $size,
            $size,
            true,
            true,
            false,
            80,
            $format
        );
        $thumbnailImage = $this->thumbnailService->getThumbnail($asset, $thumbnailConfiguration);
        if ($thumbnailImage instanceof ImageInterface) {
            if ($stream = $thumbnailImage->getResource()->getStream()) {
                if (is_resource($stream)) {
                    if ($content = stream_get_contents($stream)) {
                        if (is_string($content)) {
                            return $content;
                        }
                    }
                }
            }
        }
        return null;
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
}
