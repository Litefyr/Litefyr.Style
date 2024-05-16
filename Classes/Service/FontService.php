<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class FontService
{
    /**
     * @var array<string, mixed>
     */
    #[Flow\InjectConfiguration('frontendConfiguration.LitefyrStyleEditorsFont', 'Neos.Neos.Ui')]
    protected array $fontSettings;

    /**
     * Get font faces and preload tags from a site node
     *
     * @param array{main?: mixed, headline?: mixed, quote?: mixed, button?: mixed} $fonts
     * @return array{preloadTags: string, fontFaces: string}
     */
    protected function getFontFacesAndPreloadTags(array $fonts): array
    {
        $fontFaces = [];
        $preloadTags = [];
        $folder = $this->fontSettings['folder'];
        foreach ($fonts as $font) {
            $name = $font['font'];
            $fontSettings = $this->fontSettings['fonts'][$name];

            $hasUserSettings = isset($font['userSettings']['variable']);
            $isVariableFont = $hasUserSettings
                ? $font['userSettings']['variable']
                : is_string($fontSettings['fontWeight']);

            // The font is a variable font, so we only need to load one file
            if ($isVariableFont) {
                $fontWeightFromSettings = $fontSettings['fontWeight'];
                $filepath = $fontSettings['filepath'] ?? sprintf('%s/%s.woff2', $folder, $name);
                $fontFaces[] = $this->returnFontFace($name, $fontWeightFromSettings, $filepath);
                $preloadTags[] = $this->fontPreload($filepath);
                continue;
            }

            $fontWeightNormal = $font['userSettings']['fontWeight']['normal'] ?? 400;
            $fontWeightBold = $font['userSettings']['fontWeight']['bold'] ?? 600;

            $filepath = $fontSettings['filepath'] ?? sprintf('%s/%s-%s.woff2', $folder, $name, $fontWeightNormal);
            $fontFaces[] = $this->returnFontFace($name, $fontWeightNormal, $filepath);
            $preloadTags[] = $this->fontPreload($filepath);

            if ($fontWeightNormal != $fontWeightBold) {
                $filepath = $fontSettings['filepath'] ?? sprintf('%s/%s-%s.woff2', $folder, $name, $fontWeightBold);
                $fontFaces[] = $this->returnFontFace($name, $fontWeightBold, $filepath);
                $preloadTags[] = $this->fontPreload($filepath);
            }
        }

        return [
            'preloadTags' => implode('', array_unique($preloadTags)),
            'fontFaces' => implode('', array_unique($fontFaces)),
        ];
    }

    /**
     * Return a font face
     *
     * @param string $name
     * @param string|int $fontWeight
     * @param string $filepath
     * @return string
     */
    protected function returnFontFace(string $name, string|int $fontWeight, string $filepath): string
    {
        $format = pathinfo($filepath, PATHINFO_EXTENSION);
        return sprintf(
            '@font-face{font-family:%s;font-weight:%s;font-display:swap;font-style:normal;src: url("%s") format("%s")}',
            $name,
            (string) $fontWeight,
            $filepath,
            $format
        );
    }

    /**
     * Get font preload links
     *
     * @param string $filepath
     * @return string
     */
    protected function fontPreload(string $filepath): string
    {
        $format = pathinfo($filepath, PATHINFO_EXTENSION);
        return sprintf('<link rel="preload" href="%s" as="font" type="font/%s" crossorigin>', $filepath, $format);
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
            $name = $font['font'];
            $fontSettings = $this->fontSettings['fonts'][$name];
            $fallback = $this->fontSettings['fallback'][$fontSettings['group']];

            // Font familiy definition
            $fontProperties[] = sprintf('--font-%s:%s, %s;', $key, $name, $fallback);

            // Font feature settings
            $fontProperties[] = sprintf(
                '--font-%s--feature:%s;',
                $key,
                $font['style']['normal']['fontFeatureSettings'] ?? 'normal'
            );

            // Font variation settings
            $fontProperties[] = sprintf(
                '--font-%s--variation:%s;',
                $key,
                $font['style']['normal']['fontVariationSettings'] ?? 'normal'
            );

            // Font weight settings
            $fontProperties[] = sprintf(
                '--font-weight-%s:%s;',
                $key,
                $font['userSettings']['fontWeight']['normal'] ?? 400
            );
            $fontProperties[] = sprintf(
                '--font-weight-%s-bold:%s;',
                $key,
                $font['userSettings']['fontWeight']['bold'] ?? 600
            );
        }

        return implode('', array_unique($fontProperties));
    }

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
        ];
        $fonts = $this->makeSureMainFontIsSet($fonts);

        $fontFacesAndPreloadTags = $this->getFontFacesAndPreloadTags($fonts);

        return [
            'fonts' => $fonts,
            'markup' => $fontFacesAndPreloadTags['preloadTags'],
            'CSS' => [
                'onStart' => $fontFacesAndPreloadTags['fontFaces'],
                'root' => $this->getFontCssProperties($fonts),
            ],
        ];
    }

    /**
     * Make sure that the main font is set
     *
     * @param array{main: mixed, headline: mixed, quote: mixed, button: mixed} $fonts
     * @return array{main?: mixed, headline?: mixed, quote?: mixed, button?: mixed}
     */
    protected function makeSureMainFontIsSet(array $fonts): array
    {
        // Make sure main is set
        if (!isset($fonts['main']) || !isset($fonts['main']['font'])) {
            $fonts['main'] = [
                'font' => $this->fontSettings['fallbackFont'],
            ];
        }
        $fonts = array_filter($fonts, function ($font) {
            return $font && isset($font['font']);
        });
        return $fonts;
    }
}
