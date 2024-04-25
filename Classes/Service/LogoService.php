<?php

namespace Litespeed\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class LogoService
{
    /**
     * Get sizes for the logo
     *
     * @param NodeInterface $node
     * @return string
     */
    public function getLogoSizes(NodeInterface $node): array
    {
        $size = $node->getProperty('themeLogoSize') ?? null;
        $size = ($logoSize ?? 40) / 1.25;
        $sizeInContent = $node->getProperty('themeLogoSizeInContent');
        $sizeInContent = $sizeInContent ? $sizeInContent : 600;

        $config = [
            'size' => $size,
            'size-content' => $sizeInContent,
        ];

        $CSS = '';
        foreach ($config as $key => $value) {
            $CSS .= sprintf('--logo-%s:%srem;', $key, round($value / 16, 4));
        }

        return [
            'config' => $config,
            'CSS' => [
                'root' => $CSS,
            ],
        ];
    }
}
