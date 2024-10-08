<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\I18n\EelHelper\TranslationHelper;
use Neos\Eel\FlowQuery\FlowQuery;

class ColorDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-color';

    #[Flow\Inject]
    protected TranslationHelper $translationHelper;

    /**
     * @param NodeInterface $node The node that is currently edited (optional)
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $node = $this->getStyleNode($node);

        if (!$node) {
            return [];
        }

        $colorScheme = $node->getProperty('themeColorScheme');
        $hasMultipleColors = $colorScheme == 'light dark';
        $schemas = $hasMultipleColors ? ['Light', 'Dark'] : [ucfirst($colorScheme)];

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
        if (
            ($this->isArgumentSet($arguments, 'default') || $this->isArgumentSet($arguments, 'inverted')) &&
            ($backgroundAndForeground = $this->getProperties($node, $schemas) ?? null)
        ) {
            $default = [];
            $inverted = [];
            foreach ($backgroundAndForeground as $value) {
                $hexValues = $value['hex'];
                $default[] = array_shift($hexValues);
                $inverted[] = end($hexValues);
            }
            $default = array_filter($default);
            $inverted = array_filter($inverted);
            if (count($default)) {
                $colors['default'] = $default;
            }
            if (count($inverted)) {
                $colors['inverted'] = $inverted;
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
        foreach ($arguments as $key => $value) {
            if (!$this->valueCheck($value, $key, $colors)) {
                continue;
            }

            $color = is_array($value) && isset($value['color']) ? $value['color'] : $colors[$key];
            $colorName = $this->getColorName($value, $key);

            $options[] = [
                'value' => $key == 'none' ? '' : $key,
                'color' => $color,
                'description' => $colorName,
            ];
        }

        return $options;
    }

    /**
     * Get the style node
     *
     * @param NodeInterface $node
     * @return NodeInterface|null
     */
    protected function getStyleNode(NodeInterface $node): ?NodeInterface
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
