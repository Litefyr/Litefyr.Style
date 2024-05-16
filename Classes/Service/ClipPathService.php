<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class ClipPathService
{
    /**
     * Read values from the node and return the clip path CSS property
     *
     * @param NodeInterface $node
     * @return array{CSS:array{root:string,onEnd:string}}
     */
    public function getClipPath(NodeInterface $node): array
    {
        $afterNavigation = $node->getProperty('themeClipPathBelowNavigation');
        $inContent = $node->getProperty('themeClipPathInContent');
        $beforeFooter = $node->getProperty('themeClipPathAboveFooter');

        $clipPathEnabled = false;

        if ($afterNavigation || $inContent || $beforeFooter) {
            $clipPath = $node->getProperty('themeClipPath') ?? [];
            $clipPathCSS = $this->getCustomClipPathCssProperty($clipPath);
            $clipPathEnabled = !!$clipPathCSS;
        }

        $node->setProperty('themeClipPathEnabled', $clipPathEnabled);

        if ($clipPathEnabled && $inContent) {
            // Clip path utliities
            // clippath:hidden Hide the elment
            // clippath:bg-transparent Make the background transparent
            $utilityClasses = '.clippath\:hidden{display:none}.clippath\:bg-transparent{background-color:transparent}';
            // Important variants
            $utilityClasses .=
                '.clippath\:\!hidden{display:none !important}.clippath\:\!bg-transparent{background-color:transparent !important}';
        }

        return [
            'CSS' => [
                'root' => $clipPathCSS ?? '',
                'onEnd' => $utilityClasses ?? '',
            ],
        ];
    }

    /**
     * Add the CSS property for the clip path
     *
     * @param array{top?:string,bottom?:string,height:int,width:int} $config
     * @return string|null
     */
    protected function getCustomClipPathCssProperty(array $config): ?string
    {
        $top = $config['top'] ?? null;
        $bottom = $config['bottom'] ?? null;
        if (!$top || !$bottom) {
            return null;
        }

        $identicalTopAndBottom = $top === $bottom;

        if ($identicalTopAndBottom) {
            $path = $top;
            $top = 'var(--clippath-path)';
            $bottom = $top;
        }

        $height = round(($config['height'] / $config['width']) * 100, 6);
        $topStart = '100% 100%,0% 100%';
        $bottomStart = '100% 0%,0% 0%';

        return implode('', [
            '--clippath-display:block;',
            '--clippath-display-top:block;',
            '--clippath-display-bottom:block;',
            sprintf('--clippath-ratio:%s / %s;', $config['width'], $config['height']),
            sprintf('--clippath-margin:-%s%%;', $height),
            sprintf('--clippath-height:%svw;', $height),
            sprintf('--clippath-height-half:%svw;', $height / 2),
            $identicalTopAndBottom ? sprintf('--clippath-path:%s;', $path) : '',
            sprintf('--clippath-path-top:polygon(%s,%s);', $topStart, $top),
            sprintf('--clippath-path-bottom:polygon(%s,%s);', $bottomStart, $bottom),
        ]);
    }
}
