<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class LogoService
{
    /**
     * Get sizes for the logo
     *
     * @param NodeInterface $node
     * @return array{config: array{size: float, size-content: float}, CSS: array{root: string}}
     */
    public function getLogoSizes(NodeInterface $node): array
    {
        $logoSize = $node->getProperty('themeLogoSize') ?? 40;
        $marginTop = $node->getProperty('themeLogoMarginTop') ?? 0;
        $marginBottom = $node->getProperty('themeLogoMarginBottom') ?? 0;

        $size = $logoSize / 1.25;
        $sizeInContent = $node->getProperty('themeLogoSizeInContent');
        $sizeInContent = $sizeInContent ? $sizeInContent : 600;

        $height = [
            'mobile' => $size + $marginTop + $marginBottom,
            'desktop' => $logoSize + $marginTop + $marginBottom,
        ];

        $config = [
            'size' => $size,
            'size-content' => $sizeInContent,
        ];

        $CSS = '';
        foreach ($config as $key => $value) {
            $CSS .= sprintf('--logo-%s:%srem;', $key, round($value / 16, 4));
        }
        foreach ($height as $key => $value) {
            $CSS .= sprintf('--header-height-%s:%spx;', $key, $value);
        }

        return [
            'config' => $config,
            'CSS' => [
                'root' => $CSS,
            ],
        ];
    }
}
