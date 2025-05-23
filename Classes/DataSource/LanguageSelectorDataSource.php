<?php

namespace Litefyr\Style\DataSource;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;

class LanguageSelectorDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-language-selector';

    #[Flow\InjectConfiguration('contentDimensions.language', 'Neos.ContentRepository')]
    protected $language;

    #[Flow\InjectConfiguration('iconLocation', 'Garagist.Fontawesome')]
    protected $iconLocation;

    #[Flow\InjectConfiguration('styles', 'Garagist.Fontawesome')]
    protected $iconStyles;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        if (empty($this->language)) {
            return [
                'hidden' => true,
            ];
        }
        $type = $arguments['type'] ?? 'default';

        if ($type == 'style') {
            $icon = $arguments['icon'] ?? null;
            if (
                !$icon ||
                str_starts_with($icon, 'ClientEval') ||
                $icon == 'longLabel' ||
                $icon == 'shortLabel' ||
                $this->iconLocation != 'Garagist.FontawesomePro/Public/Icons'
            ) {
                return [
                    'hidden' => true,
                ];
            }

            $values = [];
            foreach ($this->iconStyles as $style) {
                if ($style == 'brands') {
                    continue;
                }
                $values[] = [
                    'value' => $style,
                    'preview' => file_get_contents(
                        sprintf('resource://%s/%s/%s.svg', $this->iconLocation, $style, $icon)
                    ),
                ];
            }
            return $values;
        }

        $style = $arguments['style'] ?: 'solid';
        if (str_starts_with($style, 'ClientEval')) {
            return [
                'hidden' => true,
            ];
        }

        $key = $this->language['default'];
        $icons = ['language', 'globe', 'earth-europe'];
        $labelCustomStyle = [
            'margin' => '0 -12px',
            'display' => 'block',
        ];

        $values = [
            [
                'value' => 'shortLabel',
                'label' => $key,
                'labelCustomStyle' => $labelCustomStyle,
            ],
            [
                'value' => 'longLabel',
                'label' => $this->language['presets'][$key]['label'],
                'labelCustomStyle' => $labelCustomStyle,
            ],
        ];

        foreach ($icons as $icon) {
            $values[] = [
                'value' => $icon,
                'preview' => file_get_contents(sprintf('resource://%s/%s/%s.svg', $this->iconLocation, $style, $icon)),
            ];
        }

        return $values;
    }
}
