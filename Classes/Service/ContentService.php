<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class ContentService
{
    /**
     * Return the css for the footer
     *
     * @param NodeInterface $node
     * @return array{CSS: array{onEnd: string}}
     */
    public function getContent(NodeInterface $node): array
    {
        $spacing = (float) $node->getProperty('themeContentSpacing') ?? 0;
        if (!$spacing) {
            $spacing = 8;
        }
        $headlineAlignment = $node->getProperty('themeContentHeadlineAlignment') ?? 'center';
        // The minimum spacing 2.5 == 0.625rem == 10px
        $halfSpacing = max(2.5, $spacing / 2);

        $onEnd = sprintf(
            ':where(.headline-alignment,.headline-alignment+.lead,.headline-alignment+*>.lead:first-child){text-align:%s}',
            $headlineAlignment
        );
        if ($headlineAlignment == 'left') {
            $onEnd .= '.headline-alignment-margin{margin-right:auto}';
            $onEnd .= '.headline-alignment-justify{justify-content:start}';
        } elseif ($headlineAlignment == 'right') {
            $onEnd .= '.headline-alignment-margin{margin-left:auto}';
            $onEnd .= '.headline-alignment-justify{justify-content:end}';
        } else {
            $onEnd .= '.headline-alignment-margin{margin-left:auto;margin-right:auto}';
            $onEnd .= '.headline-alignment-justify{justify-content:center}';
        }

        return [
            'CSS' => [
                'root' => sprintf('--content-space:%srem;--content-space-half:%srem;', $spacing / 4, $halfSpacing / 4),
                'onEnd' => $onEnd,
            ],
        ];
    }
}
