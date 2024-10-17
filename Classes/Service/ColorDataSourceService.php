<?php

namespace Litefyr\Style\Service;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\EelHelper\TranslationHelper;
use function sprintf;

#[Flow\Scope('singleton')]
class ColorDataSourceService
{
    #[Flow\Inject]
    protected TranslationHelper $translationHelper;

    /**
     * Get the scheme
     *
     * @param NodeInterface $node
     * @return string|null
     */
    public function getScheme(NodeInterface $node = null): ?string
    {
        $node = $this->getStyleNode($node);

        if (!$node) {
            return null;
        }
        return $node->getProperty('themeColorScheme');
    }

    /**
     * Get the data
     *
     * @param string $type 'color' or 'colorpicker'
     * @param NodeInterface $node
     * @param array $arguments Additional arguments (key / value)
     * @param string $scheme
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(
        string $type,
        NodeInterface $node = null,
        array $arguments = [],
        ?string $forceScheme = null
    ) {
        $isColorPicker = $type === 'colorpicker';
        if (!$isColorPicker && $type !== 'color') {
            return [];
        }

        $node = $this->getStyleNode($node);

        if (!$node) {
            return [];
        }

        $colorScheme = $node->getProperty('themeColorScheme');
        $hasMultipleColors = $colorScheme == 'light dark';
        $schemas = $hasMultipleColors ? ['Light', 'Dark'] : [ucfirst($colorScheme)];
        if ($forceScheme && $hasMultipleColors) {
            $schemas = [ucfirst($forceScheme)];
        }
        if ($forceScheme && !$hasMultipleColors && $colorScheme != $forceScheme) {
            return [];
        }

        // Init colors
        $colors = [];

        // Get colors from the oklch color picker.
        foreach (['Main', 'Minor', 'Minor2', 'Gray'] as $propertyName) {
            if (!$this->isArgumentSet($arguments, strtolower($propertyName))) {
                continue;
            }

            $properties = $this->getProperties($node, $schemas, $propertyName);
            if (!$properties) {
                continue;
            }
            $values = [];
            foreach ($properties as $value) {
                $values[] = $value['hex'] ?? null;
            }
            $values = array_filter($values);
            if (!count($values)) {
                continue;
            }
            $colors[strtolower($propertyName)] = $values;
        }

        // Get default and inverted values, based on text and background colors.
        $textIsSet = $this->isArgumentSet($arguments, 'text');
        $backgroundIsSet = $this->isArgumentSet($arguments, 'background');
        if (
            ($textIsSet || $backgroundIsSet) &&
            ($backgroundAndForeground = $this->getProperties($node, $schemas) ?? null)
        ) {
            $text = [];
            $background = [];
            foreach ($backgroundAndForeground as $value) {
                $hexValues = $value['hex'];
                $text[] = array_shift($hexValues);
                $background[] = end($hexValues);
            }
            $text = $textIsSet ? array_filter($text) : [];
            $background = $backgroundIsSet ? array_filter($background) : [];
            if (count($text)) {
                $colors['text'] = $text;
            }
            if (count($background)) {
                $colors['background'] = $background;
            }
        }

        // Get special colors for buttons and links.
        if ($this->isArgumentSet($arguments, 'ghost')) {
            $ghostColors = ['white', 'black'];
            if (!$hasMultipleColors) {
                $ghostColors = $colorScheme == 'light' ? 'white' : 'black';
            }
            $colors['ghost'] = $ghostColors;
        }

        // Link color is a copy from the main color.
        if (isset($colors['main']) && $this->isArgumentSet($arguments, 'link')) {
            $colors['link'] = $colors['main'];
        }

        // Get the options
        $options = [];
        $presets = [];
        foreach ($arguments as $key => $value) {
            if (!$this->valueCheck($value, $key, $colors)) {
                continue;
            }

            $color = is_array($value) && isset($value['color']) ? $value['color'] : $colors[$key];
            $colorName = $this->getColorName($value, $key);

            if ($isColorPicker) {
                $presets[$colorName] = $color[0];
                continue;
            }
            switch ($key) {
                case 'none':
                    $value = '';
                    break;
                case 'text':
                    $value = 'default';
                    break;
                case 'background':
                    $value = 'inverted';
                    break;
                default:
                    $value = $key;
                    break;
            }
            $options[] = [
                'value' => $value,
                'color' => $color,
                'description' => $colorName,
            ];
        }

        if ($isColorPicker) {
            $options['presets'] = $presets;
            if ($this->isArgumentSet($arguments, 'contrastThreshold')) {
                $contrastThreshold = $node->getProperty('themeColorContrastThreshold') ?: 65;
                $options['contrastThreshold'] = $contrastThreshold / 100;
            }
        }

        return $options;
    }

    /**
     * Get the style node
     *
     * @param NodeInterface $node
     * @return NodeInterface|null
     */
    public function getStyleNode(NodeInterface $node): ?NodeInterface
    {
        return (new FlowQuery([$node]))
            ->closest('[instanceof Litefyr.Style:Mixin.Colors]')
            ->get(0);
    }

    /**
     * Check if the argument is set
     *
     * @param array $arguments
     * @param string $key
     * @return boolean
     */
    protected function isArgumentSet(array $arguments, string $key): bool
    {
        return isset($arguments[$key]) && $arguments[$key];
    }

    /**
     * Check the value
     *
     * @param string|boolean|array $input
     * @param string $key
     * @param array $colors
     * @return boolean
     */
    protected function valueCheck($input, string $key, array $colors)
    {
        if (!$input || $input === 'false' || !array_key_exists($key, $colors) || !$colors[$key]) {
            return false;
        }
        if ($input === 'true') {
            return true;
        }
        if (is_array($input)) {
            if (isset($input['value'])) {
                return $this->valueCheck($input['value'], $key, $colors);
            }
            return true;
        }
        return !!$input;
    }

    /**
     * Get the properties
     *
     * @param NodeInterface $node
     * @param array $schemas
     * @param string $key (optional)
     * @return array|null
     */
    protected function getProperties(NodeInterface $node, array $schemas, string $key = ''): ?array
    {
        $array = [];
        foreach ($schemas as $scheme) {
            $property = sprintf('themeColor%s%s', $scheme, $key);
            $value = $node->getProperty($property);
            if ($value) {
                $array[] = $value;
            }
        }
        $array = array_filter($array);
        if (!count($array)) {
            return null;
        }
        return $array;
    }

    /**
     * Get the color name
     *
     * @param string|boolean|array $value
     * @param string $key
     * @return string
     */
    protected function getColorName($value, string $key): ?string
    {
        if (is_string($value) && $value !== 'true') {
            return $value;
        }

        if (is_array($value) && isset($value['label'])) {
            return $this->getColorName($value['label'], $key);
        }

        return $this->translationHelper->translate($key, $key, [], 'NodeTypes.Mixin.Colors', 'Litefyr.Style');
    }
}
