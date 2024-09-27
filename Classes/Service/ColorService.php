<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Carbon\ColorPicker\OKLCH\EelHelper\ConvertHelper;

/**
 * @phpstan-type ColorCoords array{l:float,c:float,h:float}
 * @phpstan-type CustomProperty array{coords:string,oklch:string,hex:string}
 * @phpstan-type ColorArray array{hex:string,oklch:string,coords:ColorCoords,customProperty:CustomProperty}
 * @phpstan-type SchemeArray array{back:mixed,front:mixed,main:mixed,minor:mixed,minor2:mixed,gray:mixed,header:mixed|null,footer:mixed}
 */
#[Flow\Scope('singleton')]
class ColorService
{
    #[Flow\Inject]
    protected ConvertHelper $convert;

    /**
     * @var array<string,mixed>
     */
    #[Flow\InjectConfiguration('frontendConfiguration.CarbonTailwindColors.colors', 'Neos.Neos.Ui')]
    protected array $colors;

    /**
     * @var array{scheme:string,mainColor:string,rounded:int}
     */
    #[Flow\InjectConfiguration('default')]
    protected array $default;

    /**
     * @var array<string,array<string,string>>
     */
    #[Flow\InjectConfiguration('additionalThemeSelector')]
    protected $additionalThemeSelector;

    protected float $colorContrastThreshold;

    protected float $minContrastLightness;

    protected float $maxContrastLightness;

    /**
     * @var null|ColorArray
     */
    protected $fallbackMain = null;

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
     * @return array{light:mixed,dark:mixed,scheme:mixed,CSS:mixed,colorThemeMeta:string}
     */
    public function getColors(NodeInterface $node): array
    {
        $this->setColorContrast($node);
        $scheme = $node->getProperty('themeColorScheme') ?? 'light';
        $this->fallbackMain = $this->convert->toOkLch($this->default['mainColor']);

        $light = null;
        $dark = null;
        $colorThemeMeta = [];

        if (str_contains($scheme, 'light')) {
            $light = $this->getColorsFromScheme($node, 'Light');
            $colorThemeMeta['light'] = $light['header']['hex'] ?? ($light['main']['hex'] ?? null);
        }

        if (str_contains($scheme, 'dark')) {
            $dark = $this->getColorsFromScheme($node, 'Dark');
            $colorThemeMeta['dark'] = $dark['header']['hex'] ?? ($dark['main']['hex'] ?? null);
        }

        return [
            'light' => $light,
            'dark' => $dark,
            'scheme' => $scheme,
            'CSS' => $this->generateCSSVariables($scheme, $light, $dark, $colorThemeMeta),
            'colorThemeMeta' => $colorThemeMeta['light'] ?? ($colorThemeMeta['dark'] ?? ''),
        ];
    }

    /**
     * Set color contrast
     *
     * @param NodeInterface $node
     */
    protected function setColorContrast(NodeInterface $node): void
    {
        $this->colorContrastThreshold = ($node->getProperty('themeColorContrastThreshold') ?? 65) / 100;
        $this->minContrastLightness = ($node->getProperty('themeColorContrastLightnessMin') ?? 5) / 100;
        $this->maxContrastLightness = ($node->getProperty('themeColorContrastLightnessMax') ?? 95) / 100;
    }

    /**
     * Get color from tailwind color group selector
     *
     * @param NodeInterface $node
     * @param string $propertyName
     * @param boolean $isLight
     * @return array{group:string,strength:int,color:ColorArray|null}
     */
    protected function getColorFromGroup(NodeInterface $node, string $propertyName, bool $isLight): array
    {
        $property = $node->getProperty($propertyName);
        $scheme = $property['group'] ?? $this->default['scheme'];
        $strength =
            $property['strength'] ??
            (str_contains($propertyName, 'Background') ? ($isLight ? 0 : 950) : ($isLight ? 900 : 100));
        return [
            'group' => $scheme,
            'strength' => $strength,
            'color' => $this->convert->toOkLch($this->getColorBasedOnSettings($scheme, $strength) ?? ''),
        ];
    }

    /**
     * Get the background variant
     *
     * @param array{strength:int,group:string} $background
     * @param boolean $isLight
     * @return ColorArray|null
     */
    protected function getBackgroundVariant(string $group, int $strength, bool $isLight): ?array
    {
        if ($strength == 50 || $strength == 950) {
            $strength += 50;
        }
        $strength = $isLight ? min($strength + 100, 400) : max($strength - 100, 600);
        return $this->convert->toOkLch($this->getColorBasedOnSettings($group, $strength) ?? '');
    }

    /**
     * Get color from a particular scheme
     *
     * @param NodeInterface $node
     * @param string $scheme
     * @return SchemeArray
     */
    protected function getColorsFromScheme(NodeInterface $node, string $scheme): array
    {
        $isLight = $scheme === 'Light';
        $backgroundAndText = $node->getProperty(sprintf('themeColor%s', $scheme));
        $backHex = $backgroundAndText ? $backgroundAndText['hex'][0] : ($isLight ? '#ffffff' : '#111111');
        $frontHex = $backgroundAndText ? $backgroundAndText['hex'][1] : ($isLight ? '#111111' : '#efefef');

        $main = $this->getColor($node, sprintf('themeColor%sMain', $scheme)) ?? $this->fallbackMain;

        if ($backgroundAndText) {
            $gray = $this->getBackgroundVariant(
                $backgroundAndText['group'],
                $backgroundAndText['strength'][0],
                $isLight
            );
        } else {
            $gray = $this->convert->toOkLch($isLight ? '#DDDDDD' : '#222222');
        }

        return [
            'back' => $this->convert->toOkLch($backHex),
            'front' => $this->convert->toOkLch($frontHex),
            'main' => $main,
            'minor' => $this->getColor($node, sprintf('themeColor%sMinor', $scheme)) ?? $main,
            'minor2' => $this->getColor($node, sprintf('themeColor%sMinor2', $scheme)) ?? $main,
            'gray' => $gray,
            'header' => $this->getColor($node, sprintf('themeColor%sHeader', $scheme)) ?? null,
            'footer' => $this->getColor($node, sprintf('themeColor%sFooter', $scheme)) ?? $gray,
        ];
    }

    /**
     * Get color from node
     *
     * @param NodeInterface $node
     * @param string $property
     * @return ColorArray|null
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
     * @param SchemeArray|null $light scheme config
     * @param SchemeArray|null $dark scheme config
     * @param array{light?:string,dark?:string}|null $colorThemeMeta
     * @return array{onStart:string,root:string,light:string,dark:string,backend:string}
     */
    protected function generateCSSVariables(string $scheme, ?array $light, ?array $dark, ?array $colorThemeMeta): array
    {
        $rootCSS = sprintf(
            '--tw-infinite:99999;--tw-lightness-threshold:%s;--tw-min-contrast-lightness:%s;--tw-max-contrast-lightness:%s;',
            $this->colorContrastThreshold,
            $this->minContrastLightness,
            $this->maxContrastLightness
        );
        $rootCSS .= sprintf('color-scheme:%s;', $scheme);
        $lightCSS = $this->generateCSSVariablesFromScheme($light);
        $darkCSS = $this->generateCSSVariablesFromScheme($dark);
        $oneScheme = $light == null || $dark == null;

        if (!empty($colorThemeMeta['light'])) {
            $rootCSS .= sprintf('--color-theme-light:%s;', $colorThemeMeta['light']);
        }
        if (!empty($colorThemeMeta['dark'])) {
            $rootCSS .= sprintf('--color-theme-dark:%s;', $colorThemeMeta['dark']);
        }

        return [
            'onStart' => $oneScheme ? $lightCSS . $darkCSS : '',
            'root' => $rootCSS,
            'light' => $oneScheme ? '' : $lightCSS,
            'dark' => $oneScheme ? '' : $darkCSS,
            'backend' => $this->generateBackendCSSVariables($light ?? $dark),
        ];
    }

    /**
     * @param SchemeArray|null $scheme
     * @return string
     */
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

    /**
     * @param array{l?:int|float,c?:int|float,h?:int|float,coords?:array{l:int|float,c:int|float,h:int|float}} $config
     * @return array
     */
    protected function getMinMaxLuminanceFromColorOrCoords(array $config, bool $invert = false): array
    {
        $coords = $config['coords'] ?? $config;
        $luminance = $coords['l'];

        if (
            (!$invert && $luminance > $this->colorContrastThreshold) ||
            ($invert && $luminance <= $this->colorContrastThreshold)
        ) {
            return [
                'min' => $this->colorContrastThreshold,
                'max' => 1,
            ];
        }

        return [
            'min' => 0,
            'max' => $this->colorContrastThreshold,
        ];
    }

    /**
     * @param string $colorName
     * @param array{l?:int|float,c?:int|float,h?:int|float,coords?:array{l:int|float,c:int|float,h:int|float}} $config
     * @param array{min:float,max:float}|null $config
     * @return string
     */
    protected function generateCustomPropertyFromColorOrCoords(
        string $colorName,
        array $config,
        ?array $minMaxLuminance = null
    ): string {
        $css = '';
        $coords = $config['coords'] ?? $config;
        foreach ($coords as $key => $value) {
            if (is_array($value)) {
                continue;
            }
            if ($minMaxLuminance && $key === 'l') {
                $value = min(max($value, $minMaxLuminance['min']), $minMaxLuminance['max']);
            }
            $css .= sprintf('--color-%s-%s:%s;', $colorName, $key, $value);
        }
        return $css;
    }

    /**
     * @param string $name
     * @param array{coords:ColorCoords} $color
     * @param boolean $setoffset
     * @return string
     */
    protected function getTextContrastColor(string $name, array $color, bool $setoffset = false): string
    {
        // luminance with value 0 is black, 1 is white
        $luminance = $color['coords']['l'];

        if (!$setoffset) {
            if ($luminance > $this->colorContrastThreshold) {
                return $this->generateCustomPropertyFromColorOrCoords($name, self::BLACK);
            }
            return $this->generateCustomPropertyFromColorOrCoords($name, self::WHITE);
        }

        $luminance =
            $luminance > $this->colorContrastThreshold ? $this->minContrastLightness : $this->maxContrastLightness;

        $coords = [
            'l' => min(max($luminance, 0), 1),
            'c' => $color['coords']['c'],
            'h' => $color['coords']['h'],
        ];

        return $this->generateCustomPropertyFromColorOrCoords($name, $coords);
    }

    /**
     * @param string $theme
     * @return string
     */
    protected function getThemeSelector(string $theme): string
    {
        $value = sprintf(
            '[data-theme="%s"],.focus-within\:theme-%s:focus-within,.focus\:theme-%s:focus,.hover\:theme-%s:hover',
            $theme,
            $theme,
            $theme,
            $theme
        );
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
     * @param array{back?:mixed,front?:mixed,main?:mixed,minor?:mixed,minor2?:mixed,gray?:mixed,header?:mixed,footer?:mixed}|null $colors
     * @return string
     */
    protected function generateCSSVariablesFromScheme(?array $colors): string
    {
        if (!$colors) {
            return '';
        }

        // default
        $defaultMinMaxLuminance = $this->getMinMaxLuminanceFromColorOrCoords($colors['back'], true);
        $default = $this->generateCustomPropertyFromColorOrCoords('back', $colors['back']);
        $default .= $this->generateCustomPropertyFromColorOrCoords('front', $colors['front']);
        $default .= $this->generateCustomPropertyFromColorOrCoords('accent', $colors['main'], $defaultMinMaxLuminance);

        // inverted
        $invertedMinMaxLuminance = $this->getMinMaxLuminanceFromColorOrCoords($colors['front'], true);
        $inverted = $this->generateCustomPropertyFromColorOrCoords('back', $colors['front']);
        $inverted .= $this->generateCustomPropertyFromColorOrCoords('front', $colors['back']);
        $inverted .= $this->generateCustomPropertyFromColorOrCoords(
            'accent',
            $colors['main'],
            $invertedMinMaxLuminance
        );

        // main
        $main = $this->generateCustomPropertyFromColorOrCoords('back', $colors['main']);
        $main .= $this->getTextContrastColor('front', $colors['main'], true);
        $main .= $this->getTextContrastColor('accent', $colors['main']);

        // minor
        $minor = $this->generateCustomPropertyFromColorOrCoords('back', $colors['minor']);
        $minor .= $this->getTextContrastColor('front', $colors['minor'], true);
        $minor .= $this->getTextContrastColor('accent', $colors['minor']);

        // minor2
        $minor2 = $this->generateCustomPropertyFromColorOrCoords('back', $colors['minor2']);
        $minor2 .= $this->getTextContrastColor('front', $colors['minor2'], true);
        $minor2 .= $this->getTextContrastColor('accent', $colors['minor2']);

        // gray
        $gray = $this->generateCustomPropertyFromColorOrCoords('back', $colors['gray']);
        $gray .= $this->getTextContrastColor('front', $colors['gray'], true);
        $gray .= $this->getTextContrastColor('accent', $colors['gray']);

        // header
        if (isset($colors['header'])) {
            $header = $this->generateCustomPropertyFromColorOrCoords('back', $colors['header']);
            $header .= $this->getTextContrastColor('front', $colors['header'], true);
            $header .= $this->getTextContrastColor('accent', $colors['header']);
        }

        // footer
        if (isset($colors['footer'])) {
            $footer = $this->generateCustomPropertyFromColorOrCoords('back', $colors['footer']);
            $footer .= $this->getTextContrastColor('front', $colors['footer'], true);
            $footer .= $this->getTextContrastColor('accent', $colors['footer']);
        }

        // Generate CSS and manage nested themes
        $CSS = '';
        $CSS .= sprintf(
            '%s,:where(body),:is([data-theme="inverted"] [data-theme="nested"]){%s}',
            $this->getThemeSelector('default'),
            $default
        );
        $CSS .= sprintf('%s{%s}', $this->getThemeSelector('inverted'), $inverted);
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
            $CSS .= sprintf('%s{%s}', $this->getThemeSelector('header'), $header);
        }
        if (isset($footer)) {
            $CSS .= sprintf('%s{%s}', $this->getThemeSelector('footer'), $footer);
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
    protected function getColorBasedOnSettings(string $group, int|string $strength): ?string
    {
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
