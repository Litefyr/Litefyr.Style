<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class ShadowService
{
    const PROPERTIES = [
        'themeShadowDropdown',
        'themeShadowDialog',
        'themeShadowTeaser',
        'themeShadowTeaserHover',
        'themeShadowTeaserTextbox',
        'themeShadowTeaserTextboxHover',
        'themeShadowTeaserPlain',
        'themeShadowTeaserPlainHover',
        'themeShadowImageTextbox',
        'themeShadowAssetsListThumbnail',
        'themeShadowAssetsListThumbnailHover',
        'themeShadowBentobox',
        'themeShadowBentoboxHover',
        'themeShadowBlockquoteWithImage',
        'themeShadowFactsAndFigures',
    ];

    /**
     * @var array<string>
     */
    #[Flow\InjectConfiguration('shadows')]
    protected array $configuration;

    protected array $defaultShadows = [];
    protected array $customShadows = [];

    /**
     * Get shadows
     *
     * @param NodeInterface $node
     * @return array
     */
    public function getShadows(NodeInterface $node): array
    {
        // Prefill the default shadows key list with null values, so that the order is correct
        $sortedKeys = array_keys($this->configuration);
        $this->defaultShadows = array_fill_keys($sortedKeys, null);

        // Get the values from the node
        foreach (self::PROPERTIES as $propertyName) {
            $this->getValues($node, $propertyName);
        }

        // Filter out the default shadows that are not used
        $this->defaultShadows = array_filter($this->defaultShadows);

        // Create the container for the custom properties
        $defaultShadows = '';
        $shadowAssignments = '';
        $singleShadows = '';

        // Generate the default shadows
        foreach ($this->defaultShadows as $key => $properties) {
            $shadowValue = $this->configuration[$key];

            // If the shadow is only used once, we can use it directly and add only this shadow
            if (count($properties) == 1) {
                $singleShadows .= sprintf('--shadow-%s:%s;', $properties[0], $shadowValue);
                continue;
            }

            // If the shadow is used multiple times, we set the shadow value once and refer the other ones to it
            $defaultShadows .= sprintf('--shadow--%s:%s;', $key, $shadowValue);
            foreach ($properties as $property) {
                $shadowAssignments .= sprintf('--shadow-%s:var(--shadow--%s);', $property, $key);
            }
        }

        // Generate the custom shadows
        foreach ($this->customShadows as $key => $value) {
            $singleShadows .= sprintf('--shadow-%s:%s;', $key, $value);
        }

        return [
            'CSS' => [
                'root' => $defaultShadows . $shadowAssignments . $singleShadows,
            ],
        ];
    }

    /**
     * Get property for shadow
     *
     * @param NodeInterface $node
     * @param string $property
     * @return void
     */
    protected function getValues(NodeInterface $node, string $property): void
    {
        $value = $node->getProperty($property);
        $key = $this->getKey($property);

        // Value is in the settings => add it to the default shadows key list
        if ($value && array_key_exists($value, $this->configuration)) {
            $this->defaultShadows[$value][] = $key;
            return;
        }

        // Value is a custom one
        if ($value && ($value !== 'false' || $value !== 'null')) {
            $this->customShadows[$key] = $value;
        }
    }

    /**
     * Helper to convert `themeShadowExample` to `shadow-example`
     * @param string $string
     * @return string The converted string
     */
    protected function getKey($string): string
    {
        $string = strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $string));

        // Remove theme-shadow- prefix
        if (str_starts_with($string, 'theme-shadow-')) {
            $string = substr($string, 13);
        }

        return $string;
    }
}
