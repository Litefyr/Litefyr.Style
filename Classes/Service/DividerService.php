<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Model\ThumbnailConfiguration;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class DividerService
{
    #[Flow\Inject]
    protected AssetService $assetService;

    /**
     * Return the css for the spacer <hr class="theme-hr">
     *
     * @param NodeInterface $node
     * @return array{CSS: array{onEnd: string}}
     */
    public function getDivider(NodeInterface $node): array
    {
        $config = [
            'soft' => (int) $node->getProperty('themeHrSoft'),
            'image' => $node->getProperty('themeHrImage'),
            'imageSize' => $node->getProperty('themeHrImageSize'),
            'imagePosition' => $node->getProperty('themeHrImagePosition'),
        ];

        $themedProperties = [
            'default' => [
                'color' => 'oklch(var(--color-back-l) var(--color-back-c) var(--color-back-h))',
            ],
            'before' => [
                'opacity' => '.4',
            ],
        ];

        $cssProperties = [
            'default' => [
                'border' => 'none',
                'min-height' => '1px',
                'color' => 'currentColor',
            ],
            'before' => [
                'content' => '""',
                'display' => 'block',
                'height' => '1px',
                'background' => 'currentColor',
            ],
            'after' => [],
        ];
        $softConfig = (int) $config['soft'];
        $softValue = $softConfig ? $softConfig . 'px' : 0;
        if ($softValue) {
            $cssProperties['default']['min-height'] = $softValue;
            $cssProperties['before']['height'] = $softValue;
            $cssProperties['before']['background'] =
                'radial-gradient(ellipse farthest-side at top,currentColor,transparent)';
        }

        if ($config['image']) {
            $size = $config['imageSize'] ?? 50;
            $thumbnailConfiguration = new ThumbnailConfiguration(null, $size * 2, null, 2560);
            $thumbnailData = $this->assetService->getThumbnailUriAndSizeForAsset(
                $config['image'],
                $thumbnailConfiguration
            );
            if ($thumbnailData === null) {
                return $this->writeHrCSS($cssProperties, $themedProperties);
            }

            $height = $thumbnailData['height'] / 2;
            $minHeight = max($softConfig, $height);
            $cssProperties['default']['position'] = 'relative';
            $cssProperties['default']['min-height'] = $minHeight ? $minHeight . 'px' : 0;
            $position = $config['imagePosition'] ?? 'center';

            if ($position != 'bottom') {
                $cssProperties['before']['position'] = 'absolute';
                $cssProperties['before']['left'] = '0';
                $cssProperties['before']['right'] = '0';
                $cssProperties['before']['bottom'] = $position === 'top' ? 0 : sprintf('%spx', $minHeight / 2);
            }

            $cssProperties['after'] = [
                'position' => 'absolute',
                'left' => '0',
                'right' => '0',
                'bottom' => '0',
                'content' => '""',
                'display' => 'block',
                'margin' => '0 auto',
                'height' => $height . 'px',
                'background' => sprintf('url(%s) center / contain no-repeat', $thumbnailData['src']),
            ];
        }

        return $this->writeHrCSS($cssProperties, $themedProperties);
    }

    /**
     * Takes all hr properties and returns the css
     *
     * @param array{default:mixed, before:mixed, after:mixed} $cssProperties
     * @param array{default:mixed, before:mixed}  $themedProperties
     * @return array{CSS: array{onEnd: string}}
     */
    protected function writeHrCSS(array $cssProperties, array $themedProperties): array
    {
        $CSS = $this->getPropertiesString($cssProperties, false);
        $CSS .= $this->getPropertiesString($themedProperties, true);

        return [
            'CSS' => [
                'onEnd' => $CSS,
            ],
        ];
    }

    /**
     * Takes all properties and returns the css
     *
     * @param array{default:mixed, before:mixed, after?:mixed} $groupedProperties
     * @param boolean $theme
     * @return string
     */
    protected function getPropertiesString(array $groupedProperties, bool $theme = false): string
    {
        $CSS = '';
        foreach ($groupedProperties as $group => $properties) {
            if (!count($properties)) {
                continue;
            }
            $props = [];
            foreach ($properties as $key => $value) {
                $props[] = sprintf('%s:%s', (string) $key, (string) $value);
            }
            $selector = $theme ? '[data-theme]' : '';
            $selector .= $group === 'default' ? '' : '::' . $group;
            $CSS .= sprintf('.theme-hr%s{%s}', $selector, implode(';', $props));
        }

        return $CSS;
    }
}
