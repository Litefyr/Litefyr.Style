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
    public function getClipPath(NodeInterface $node): ?array
    {
        $afterNavigation = !!$node->getProperty('themeClipPathBelowNavigation');
        $inContent = !!$node->getProperty('themeClipPathInContent');
        $beforeFooter = !!$node->getProperty('themeClipPathAboveFooter');

        $clipPathEnabled = false;

        if ($afterNavigation || $inContent || $beforeFooter) {
            $clipPath = $node->getProperty('themeClipPath') ?? [];
            $CSS = $this->generateCSS($clipPath, $afterNavigation, $inContent, $beforeFooter);
            $clipPathEnabled = $CSS ? !!count($CSS) : false;
        }

        $node->setProperty('themeClipPathEnabled', $clipPathEnabled);

        if (!$clipPathEnabled) {
            return null;
        }

        return [
            'CSS' => $CSS,
        ];
    }

    /**
     * Add the CSS custom properties for the clip path
     *
     * @param array{css?:array} $config
     * @return array|null
     */
    protected function generateCSS(array $config, bool $afterNavigation, bool $inContent, bool $beforeFooter): ?array
    {
        if (!isset($config['css']) || !count($config['css'])) {
            return null;
        }

        // Properties from editor are
        // [
        //      raw => [
        //          top => string
        //          bottom => string
        //      ],
        //      height => [
        //          top => number + unit (vw), eg 50vw
        //          bottom => number + unit (vw)
        //      ],
        //      nesting => number between -1 and 0
        // ]

        $customProperties = [];
        $cssClasses = [];

        if ($beforeFooter || $inContent) {
            $customProperties['raw-top'] = $config['css']['raw']['top'];
            $customProperties['height-top'] = $config['css']['height']['top'];

            if ($config['nesting']) {
                $customProperties['nesting-multiplier'] = $config['css']['nesting'];
                $customProperties['nesting-value'] = $config['css']['height']['bottom'];
                $customProperties['nesting'] =
                    'calc(var(--clippath-nesting-value) * var(--clippath-nesting-multiplier) - 1px)';
            }
        }

        if ($afterNavigation || $inContent) {
            $customProperties['raw-bottom'] = $config['css']['raw']['bottom'];
            $customProperties['height-bottom'] = $config['css']['height']['bottom'];
        }

        if ($afterNavigation) {
            $customProperties['header-path'] = 'polygon(0 0,100% 0,var(--clippath-raw-bottom))';
            $customProperties['header-height'] = 'calc(var(--clippath-height-bottom) + var(--header-height))';
            $cssClasses[] =
                '.clippath-header{clip-path:var(--clippath-header-path);padding-bottom:var(--clippath-height-bottom)}';
            $cssClasses[] = '.clippath-header--min-h{min-height:var(--clippath-header-height)}';
        }

        if ($inContent) {
            $customProperties['content-path'] = 'polygon(var(--clippath-raw-top),var(--clippath-raw-bottom))';
            $customProperties['content-height-top'] = 'var(--clippath-height-top)';
            $customProperties['content-height-bottom'] = 'var(--clippath-height-bottom)';
            $customProperties['content-height'] =
                'calc(var(--clippath-height-top) + var(--clippath-height-bottom) + 1px)';
            $customProperties['content-height-full'] = 'calc(var(--clippath-content-height) + 100%)';

            $cssClasses[] = '.clippath-content{clip-path:var(--clippath-content-path)}';
            $cssClasses[] =
                '.clippath-padding,.clippath-content--padding,.clippath-contentbox,.clippath-content--contentbox{padding-top:var(--clippath-content-height-top);padding-bottom:var(--clippath-content-height-bottom)}';
            $cssClasses[] =
                '.clippath-padding,.clippath-content--padding,.clippath-min-height,.clippath-content--min-height{min-height:var(--clippath-content-height)}';
            $cssClasses[] = '.clippath-contentbox,.clippath-content--contentbox{box-sizing:content-box}';
            $cssClasses[] =
                '.clippath-margin,.clippath-content--margin{margin-top:var(--clippath-content-height-top);margin-bottom:var(--clippath-content-height-bottom)}';
            $cssClasses[] =
                '.clippath-min-height-full,.clippath-content--min-height-full{min-height:var(--clippath-content-height-full)}';
            // Disabled neseted clip paths
            $cssClasses[] =
                ':is(.clippath-content:not(.clippath-content--nested) .clippath-content:not(.clippath-content--nested),.clippath-not-inside){--clippath-content-height-top:0;--clippath-content-height-bottom:0;--clippath-content-height:0;--clippath-content-path:none;--clippath-content-height-full:100%;}';

            if ($config['nesting']) {
                if ($config['reverseStacking']) {
                    // override the height of the top clip path
                    $customProperties['content-height-top'] =
                        'max(var(--clippath-height-top), var(--clippath-height-bottom))';
                }
                $cssClasses[] =
                    ':is(.clippath-content,.clippath-quote,.clippath-nesting) + :is(.clippath-content,.clippath-quote,.clippath-nesting){margin-top:var(--clippath-nesting)}';
            }
        }

        if ($beforeFooter) {
            $customProperties['footer-path'] = 'polygon(var(--clippath-raw-top),100% 100%,0 100%)';
            $customProperties['footer-height'] = 'calc(var(--clippath-height-top) + var(--footer-spacing, 0px))';
            $cssClasses[] =
                '.clippath-footer{clip-path:var(--clippath-footer-path);padding-top:var(--clippath-footer-height);min-height:var(--clippath-footer-height)}';
        }

        $root = '';
        foreach ($customProperties as $key => $value) {
            if ($value) {
                $root .= sprintf('--clippath-%s:%s;', $key, $value);
            }
        }

        $onEnd = implode('', $cssClasses);
        return [
            'root' => $root,
            'onEnd' => $onEnd,
        ];
    }
}
