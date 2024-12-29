<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class FooterService
{
    /**
     * Return the css for the footer
     *
     * @param NodeInterface $node
     * @return array{CSS: array{onEnd: string}}
     */
    public function getFooter(NodeInterface $node): array
    {
        $spacing = $node->getProperty('themeFooterSpacing') ?? 32;
        // Convert to rem
        $spacing = round($spacing / 16, 4);

        return [
            'CSS' => [
                'root' => sprintf('--footer-spacing:%srem;', $spacing),
            ],
        ];
    }
}
