<?php

namespace Litespeed\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Carbon\ColorPicker\OKLCH\EelHelper\ConvertHelper;

#[Flow\Scope('singleton')]
class ColorService
{
    #[Flow\Inject]
    protected ConvertHelper $convert;

    #[
        Flow\InjectConfiguration(
            'frontendConfiguration.CarbonTailwindColors.colors',
            'Neos.Neos.Ui'
        )
    ]
    protected array $colors;

    #[Flow\InjectConfiguration('default')]
    protected array $default;

    #[Flow\InjectConfiguration('additionalThemeSelector')]
    protected $additionalThemeSelector;

    #[Flow\InjectConfiguration('colorOffset')]
    protected array $colorOffset;

    #[Flow\InjectConfiguration('colorContrastThreshold')]
    protected float $colorContrastThreshold;

    protected array $fallbackMain;

    const WHITE = [
        'l' => 1,
        'c' => 0,
        'h' => 0,
    ];

    const BLACK = [
        'l' => 0,
        'c' => 0,
        'h' => 0,
    ];

    /**
     * Get color from node and store them in the color objects
     *
     * @param NodeInterface $node
     * @return array
     */
    public function getColors(NodeInterface $node): array
    {
        $scheme = $node->getProperty('themeColorScheme') ?? 'light';
        $this->fallbackMain = $this->convert->toOkLch(
            $this->default['mainColor']
        );

        $light = null;
        $dark = null;
        $themeWebmanifestTheme = [];

        if (str_contains($scheme, 'light')) {
            $light = $this->getColorsFromScheme($node, 'Light');
            $themeWebmanifestTheme['light'] =
                $light['header']['hex'] ?? ($light['main']['hex'] ?? null);
        }

        if (str_contains($scheme, 'dark')) {
            $dark = $this->getColorsFromScheme($node, 'Dark');
            $themeWebmanifestTheme['dark'] =
                $dark['header']['hex'] ?? ($dark['main']['hex'] ?? null);
        }

        return [
            'light' => $light,
            'dark' => $dark,
            'scheme' => $scheme,
            'CSS' => $this->generateCSSVariables(
                $scheme,
                $light,
                $dark,
                $themeWebmanifestTheme
            ),
            'themeWebmanifestTheme' =>
                $themeWebmanifestTheme['light'] ??
                $themeWebmanifestTheme['dark'],
        ];
    }

    /**
     * Get color from tailwind color group selector
     *
     * @param NodeInterface $node
     * @param string $property
     * @param boolean $isLight
     * @return array
     */
    protected function getColorFromGroup(
        NodeInterface $node,
        string $propertyName,
        bool $isLight
    ): array {
        $property = $node->getProperty($propertyName);
        $scheme = $property['group'] ?? $this->default['scheme'];
        $strength =
            $property['strength'] ??
            (str_contains($propertyName, 'Background')
                ? ($isLight
                    ? 0
                    : 950)
                : ($isLight
                    ? 900
                    : 100));
        return [
            'group' => $scheme,
            'strength' => $strength,
            'color' => $this->convert->toOkLch(
                $this->getColorBasedOnSettings($scheme, $strength)
            ),
        ];
    }

    /**
     * Get the background variant
     *
     * @param array $background
     * @param boolean $isLight
     * @return array
     */
    protected function getBackgroundVariant(
        array $background,
        bool $isLight
    ): array {
        $strength = $background['strength'];
        if ($strength == 50 || $strength == 950) {
            $strength += 50;
        }
        $strength = $isLight
            ? min($strength + 100, 400)
            : max($strength - 100, 600);
        return $this->convert->toOkLch(
            $this->getColorBasedOnSettings($background['group'], $strength)
        );
    }

    /**
     * Get color from a particular scheme
     *
     * @param NodeInterface $node
     * @param string $scheme
     * @return array
     */
    protected function getColorsFromScheme(
        NodeInterface $node,
        string $scheme
    ): array {
        $isLight = $scheme === 'Light';
        $background = $this->getColorFromGroup(
            $node,
            sprintf('themeColor%sBackground', $scheme),
            $isLight
        );
        $text = $this->getColorFromGroup(
            $node,
            sprintf('themeColor%sText', $scheme),
            $isLight
        );

        $main =
            $this->getColor($node, sprintf('themeColor%sMain', $scheme)) ??
            $this->fallbackMain;
        $gray = $this->getBackgroundVariant($background, $isLight);

        return [
            'back' => $background['color'],
            'front' => $text['color'],
            'main' => $main,
            'minor' =>
                $this->getColor($node, sprintf('themeColor%sMinor', $scheme)) ??
                $main,
            'minor2' =>
                $this->getColor(
                    $node,
                    sprintf('themeColor%sMinor2', $scheme)
                ) ?? $main,
            'gray' => $gray,
            'header' =>
                $this->getColor(
                    $node,
                    sprintf('themeColor%sHeader', $scheme)
                ) ?? null,
            'footer' =>
                $this->getColor(
                    $node,
                    sprintf('themeColor%sFooter', $scheme)
                ) ?? $gray,
        ];
    }

    /**
     * Get color from node
     *
     * @param NodeInterface $node
     * @param string $property
     * @return array|null
     */
    protected function getColor(NodeInterface $node, string $property): ?array
    {
        $color = $node->getProperty($property);
        if (!$color || !isset($color['coords'])) {
            return null;
        }
        return $color;
    }

    /**
     * Generate CSS variables from the colors
     *
     * @param string $scheme
     * @param array|null light scheme config
     * @param array|null dark scheme config
     * @return array
     */
    protected function generateCSSVariables(
        string $scheme,
        ?array $light,
        ?array $dark,
        ?array $themeWebmanifestTheme
    ): array {
        $rootCSS = sprintf('color-scheme:%s;', $scheme);
        $lightCSS = $this->generateCSSVariablesFromScheme($light);
        $darkCSS = $this->generateCSSVariablesFromScheme($dark);
        $oneScheme = $light == null || $dark == null;

        if (
            !empty($themeWebmanifestTheme['light']) &&
            $themeWebmanifestTheme['light']
        ) {
            $rootCSS .= sprintf(
                '--color-theme-light:%s;',
                $themeWebmanifestTheme['light']
            );
        }
        if (
            !empty($themeWebmanifestTheme['dark']) &&
            $themeWebmanifestTheme['dark']
        ) {
            $rootCSS .= sprintf(
                '--color-theme-dark:%s;',
                $themeWebmanifestTheme['dark']
            );
        }

        return [
            'onStart' => $oneScheme ? $lightCSS . $darkCSS : '',
            'root' => $rootCSS,
            'light' => $oneScheme ? '' : $lightCSS,
            'dark' => $oneScheme ? '' : $darkCSS,
            'backend' => $this->generateBackendCSSVariables($light ?? $dark),
        ];
    }

    protected function generateBackendCSSVariables(?array $scheme): string
    {
        if (!$scheme) {
            return '';
        }

        $CSS = '';
        foreach ($scheme as $key => $value) {
            $color = $value['oklch'] ?? null;
            if ($color) {
                $CSS .= sprintf('--color-theme-%s:%s;', $key, $color);
            }
        }

        return $CSS;
    }

    protected function generateCustomPropertyFromColorOrCoords(
        string $colorName,
        array $config
    ): string {
        $css = '';
        $coords = $config['coords'] ?? $config;
        foreach ($coords as $key => $value) {
            $css .= sprintf('--color-%s-%s:%s;', $colorName, $key, $value);
        }
        return $css;
    }

    protected function getTextContrastColor(
        string $name,
        array $color,
        bool $setoffset = false
    ): string {
        // luminance with value 0 is black, 1 is white
        $luminance = $color['coords']['l'];

        if (!$setoffset) {
            if ($luminance > $this->colorContrastThreshold) {
                return $this->generateCustomPropertyFromColorOrCoords(
                    $name,
                    self::BLACK
                );
            }
            return $this->generateCustomPropertyFromColorOrCoords(
                $name,
                self::WHITE
            );
        }

        if ($luminance > $this->colorContrastThreshold) {
            $luminance = $this->colorOffset['dark'] / 100;
        } else {
            $luminance = $this->colorOffset['light'] / 100;
        }

        $coords = [
            'l' => min(max($luminance, 0), 1),
            'c' => $color['coords']['c'],
            'h' => $color['coords']['h'],
        ];

        return $this->generateCustomPropertyFromColorOrCoords($name, $coords);
    }

    protected function getThemeSelector(string $theme): string
    {
        $value = sprintf('[data-theme="%s"]', $theme);
        $additional = $this->additionalThemeSelector[$theme] ?? null;

        if ($additional) {
            if (is_array($additional)) {
                $additional = implode(',', $additional);
            }

            $value .= ',' . $additional;
        }
        return $value;
    }

    /**
     * Generate CSS variables from the color scheme
     *
     * @param array $colors
     * @return string
     */
    protected function generateCSSVariablesFromScheme(?array $colors): string
    {
        if (!$colors) {
            return '';
        }

        // default
        $default = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['back']
        );
        $default .= $this->generateCustomPropertyFromColorOrCoords(
            'front',
            $colors['front']
        );
        $default .= $this->generateCustomPropertyFromColorOrCoords(
            'accent',
            $colors['main']
        );

        // inverted
        $inverted = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['front']
        );
        $inverted .= $this->generateCustomPropertyFromColorOrCoords(
            'front',
            $colors['back']
        );
        $inverted .= $this->generateCustomPropertyFromColorOrCoords(
            'accent',
            $colors['main']
        );

        // main
        $main = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['main']
        );
        $main .= $this->getTextContrastColor('front', $colors['main'], true);
        $main .= $this->getTextContrastColor('accent', $colors['main']);

        // minor
        $minor = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['minor']
        );
        $minor .= $this->getTextContrastColor('front', $colors['minor'], true);
        $minor .= $this->getTextContrastColor('accent', $colors['minor']);

        // minor2
        $minor2 = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['minor2']
        );
        $minor2 .= $this->getTextContrastColor(
            'front',
            $colors['minor2'],
            true
        );
        $minor2 .= $this->getTextContrastColor('accent', $colors['minor2']);

        // gray
        $gray = $this->generateCustomPropertyFromColorOrCoords(
            'back',
            $colors['gray']
        );
        $gray .= $this->getTextContrastColor('front', $colors['gray'], true);
        $gray .= $this->getTextContrastColor('accent', $colors['gray']);

        // header
        if ($colors['header']) {
            $header = $this->generateCustomPropertyFromColorOrCoords(
                'back',
                $colors['header']
            );
            $header .= $this->getTextContrastColor(
                'front',
                $colors['header'],
                true
            );
            $header .= $this->getTextContrastColor('accent', $colors['header']);
        }

        // footer
        if ($colors['footer']) {
            $footer = $this->generateCustomPropertyFromColorOrCoords(
                'back',
                $colors['footer']
            );
            $footer .= $this->getTextContrastColor(
                'front',
                $colors['footer'],
                10
            );
            $footer .= $this->getTextContrastColor('accent', $colors['footer']);
        }

        // Generate CSS and manage nested themes
        $CSS = '';
        $CSS .= sprintf(
            '%s,:where(body),:is([data-theme="inverted"] [data-theme="nested"]){%s}',
            $this->getThemeSelector('default'),
            $default
        );
        $CSS .= sprintf(
            '%s{%s}',
            $this->getThemeSelector('inverted'),
            $inverted
        );
        $CSS .= sprintf(
            '%s,:is([data-theme="default"],[data-theme="minor"],[data-theme="minor2"],[data-theme="gray"]) [data-theme="nested"]{%s}',
            $this->getThemeSelector('main'),
            $main
        );
        $CSS .= sprintf(
            '%s,:is([data-theme="main"] [data-theme="nested"]){%s}',
            $this->getThemeSelector('minor'),
            $minor
        );
        $CSS .= sprintf('%s{%s}', $this->getThemeSelector('minor2'), $minor2);
        $CSS .= sprintf('%s{%s}', $this->getThemeSelector('gray'), $gray);
        if (isset($header)) {
            $CSS .= sprintf(
                '%s{%s}',
                $this->getThemeSelector('header'),
                $header
            );
        }
        if (isset($footer)) {
            $CSS .= sprintf(
                '%s{%s}',
                $this->getThemeSelector('footer'),
                $footer
            );
        }

        return $CSS;
    }

    /**
     * Get color based on settings
     *
     * @param string $group
     * @param int|string $strength
     * @return string|null
     */
    protected function getColorBasedOnSettings(
        string $group,
        int|string $strength
    ): ?string {
        $strength = (int) $strength;
        $group = $this->colors[$group];

        if ($strength == 0) {
            return '#ffffff';
        }
        if ($strength == 1000) {
            return '#000000';
        }

        return $group[$strength];
    }
}
