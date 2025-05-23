<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Litefyr\Style\Service\ColorDataSourceService;

class ColorPickerDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-colorpicker';

    #[Flow\Inject]
    protected ColorDataSourceService $colorDataSourceService;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $scheme = $arguments['scheme'] ?? null;
        if (!$scheme || !in_array($scheme, ['light', 'dark', 'all'])) {
            return [
                'hidden' => true,
            ];
        }

        if ($scheme === 'all') {
            $light = $this->colorDataSourceService->getData('colorpicker', $node, $arguments, 'light');
            $dark = $this->colorDataSourceService->getData('colorpicker', $node, $arguments, 'dark');

            $hasLight = !empty($light);
            $hasDark = !empty($dark);

            if (!$hasLight && !$hasDark) {
                return [
                    'hidden' => true,
                ];
            }
            if ($hasLight && !$hasDark) {
                return $light;
            }

            if (!$hasLight && $hasDark) {
                return $dark;
            }

            // Light and dark are available
            $options = [
                'contrastThreshold' => $light['contrastThreshold'],
                'presets' => [],
            ];
            foreach ($light['presets'] as $key => $preset) {
                $key = sprintf('%s (light)', $key);
                $options['presets'][$key] = $preset;
            }
            foreach ($dark['presets'] as $key => $preset) {
                $key = sprintf('%s (dark)', $key);
                $options['presets'][$key] = $preset;
            }
        } else {
            $options = $this->colorDataSourceService->getData('colorpicker', $node, $arguments, $scheme);
        }

        if (empty($options)) {
            return [
                'hidden' => true,
            ];
        }

        return $options;
    }
}
