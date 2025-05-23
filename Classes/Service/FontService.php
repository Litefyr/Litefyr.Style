<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Carbon\Webfonts\Service;

#[Flow\Scope('singleton')]
class FontService
{
    const FALLBACK = [
        'fontFamily' =>
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        'fontFeatureSettings' => 'normal',
        'fontVariationSettings' => 'normal',
        'fontWeight' => 400,
        'fontWeightBold' => 700,
        'cssFile' => null,
    ];

    #[Flow\Inject]
    protected Service $webfontsService;

    /**
     * Return the fonts properties from a node
     *
     * @param NodeInterface $node
     * @return array{fonts: array{main?:mixed,headline?:mixed,quote?:mixed,button?:mixed}, markup: string, CSS: array{onStart: string, root: string}}
     */
    public function getFonts(NodeInterface $node): array
    {
        $fonts = [
            'main' => $node->getProperty('themeFontMain'),
            'headline' => $node->getProperty('themeFontHeadline'),
            'quote' => $node->getProperty('themeFontQuote'),
            'button' => $node->getProperty('themeFontButton'),
            'header' => $node->getProperty('themeFontHeader'),
            'footer' => $node->getProperty('themeFontFooter'),
            'countdown' => $node->getProperty('themeFontCountdown'),
        ];
        $fonts = $this->makeSureMainFontIsSet($fonts);

        return [
            'fonts' => $fonts,
            'markup' => $this->geStylesheets($fonts),
            'CSS' => [
                'root' => $this->getFontCssProperties($fonts),
            ],
        ];
    }

    /**
     * Get stylesheets
     *
     * @param array{main?: mixed, headline?: mixed, quote?: mixed, button?: mixed} $fonts
     * @return string
     */
    protected function geStylesheets(array $fonts): string
    {
        $stylesheets = [];
        foreach ($fonts as $font) {
            $cssFilePath = $this->webfontsService->getCSSFile($font['fontFamily']);
            if (empty($cssFilePath)) {
                continue;
            }
            $stylesheets[] = sprintf('<link rel="stylesheet" href="%s">', $cssFilePath);
        }

        return implode('', array_unique($stylesheets));
    }

    /**
     * Get all font CSS properties
     *
     * @param array<string, array{font: string, style: mixed, userSettings: mixed}> $fonts
     * @return string
     */
    protected function getFontCssProperties(array $fonts): string
    {
        $fontProperties = [];
        foreach ($fonts as $key => $font) {
            // Font family
            $fontProperties[] = sprintf('--font-%s:%s;', $key, $font['fontFamily']);

            // Font feature settings
            $fontProperties[] = sprintf(
                '--font-%s--feature:%s;',
                $key,
                $font['fontFeatureSettings'] ?? self::FALLBACK['fontFeatureSettings']
            );

            // Font variation settings
            $fontProperties[] = sprintf(
                '--font-%s--variation:%s;',
                $key,
                $font['fontVariationSettings'] ?? self::FALLBACK['fontVariationSettings']
            );

            // Font weight settings
            $fontProperties[] = sprintf(
                '--font-weight-%s:%s;',
                $key,
                $font['fontWeight'] ?? self::FALLBACK['fontWeight']
            );
            $fontProperties[] = sprintf(
                '--font-weight-%s-bold:%s;',
                $key,
                $font['fontWeightBold'] ?? self::FALLBACK['fontWeightBold']
            );

            // Uppercase settings
            if ($font['uppercase'] ?? false) {
                $fontProperties[] = sprintf('--font-uppercase-%s:uppercase;', $key);
            }
        }

        return implode('', array_unique($fontProperties));
    }

    /**
     * Make sure that the main font is set
     *
     * @param array{main: mixed, headline: mixed, quote: mixed, button: mixed} $fonts
     * @return array{main?: mixed, headline?: mixed, quote?: mixed, button?: mixed}
     */
    protected function makeSureMainFontIsSet(array $fonts): array
    {
        // Make sure main font is set
        if (!isset($fonts['main']) || !isset($fonts['main']['fontFamily'])) {
            $fonts['main'] = self::FALLBACK;
        }
        $fonts = array_filter($fonts, function ($font) {
            return $font && isset($font['fontFamily']);
        });
        return $fonts;
    }
}
