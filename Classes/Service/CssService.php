<?php

namespace Litespeed\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\Core\Cache\ContentCache;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Litespeed\Style\Service\FontService;
use Litespeed\Style\Service\ClipPathService;
use Litespeed\Style\Service\DividerService;
use Litespeed\Style\Service\ColorService;
use Litespeed\Style\Service\LogoService;
use Litespeed\Style\Service\RoundedService;

#[Flow\Scope('singleton')]
class CssService
{
    #[Flow\Inject]
    protected ContentCache $contentCache;

    #[Flow\Inject]
    protected FontService $fontService;

    #[Flow\Inject]
    protected ClipPathService $clipPathService;

    #[Flow\Inject]
    protected ColorService $colorService;

    #[Flow\Inject]
    protected RoundedService $roundedService;

    #[Flow\Inject]
    protected DividerService $dividerService;

    #[Flow\Inject]
    protected LogoService $logoService;

    /**
     * Generate dynamic CSS
     *
     * @param NodeInterface $node
     * @return string|null
     */
    public function generateCss(NodeInterface $node): ?string
    {
        if (
            !$node
                ->getNodeType()
                ->isOfType('Litespeed.Integration:Document.HomePage')
        ) {
            return null;
        }

        // Get values from the site
        $colors = $this->colorService->getColors($node);
        $fonts = $this->fontService->getFonts($node);
        $clipPath = $this->clipPathService->getClipPath($node);
        $rounded = $this->roundedService->getRoudedValues($node);
        $divider = $this->dividerService->getDivider($node);
        $logo = $this->logoService->getLogoSizes($node);

        // Generate the global CSS
        $markup = '';
        $cssObject = [
            'onStart' => '',
            'root' => '',
            'light' => '',
            'dark' => '',
            'onEnd' => '',
            'backend' => '',
        ];
        foreach (
            [$fonts, $colors, $clipPath, $rounded, $divider, $logo]
            as $value
        ) {
            if (isset($value['markup'])) {
                $markup .= $value['markup'];
            }
            if (isset($value['CSS'])) {
                foreach (
                    ['onStart', 'root', 'light', 'dark', 'onEnd', 'backend']
                    as $key
                ) {
                    if (isset($value['CSS'][$key])) {
                        $cssObject[$key] .= $value['CSS'][$key];
                    }
                }
            }
        }

        // Generate CSS string
        $CSS = $cssObject['onStart'];
        if ($cssObject['root']) {
            $CSS .= sprintf(':root{%s}', $cssObject['root']);
        }
        if ($cssObject['light'] && $cssObject['dark']) {
            // We have light and dark scheme
            $CSS .= sprintf('.light{%s}', $cssObject['light']);
            $CSS .= sprintf('.dark{%s}', $cssObject['dark']);
        } elseif ($cssObject['light'] || $cssObject['dark']) {
            // We have only one scheme
            $CSS .= sprintf(
                ':root{%s%s}',
                $cssObject['light'],
                $cssObject['dark']
            );
        }
        $CSS .= $cssObject['onEnd'];

        $backendCSS = sprintf(':root{%s}', $cssObject['backend']);

        // Set properties
        $node->setProperty('themeCSS', $CSS);
        $node->setProperty('themeCSSHash', substr(hash('sha256', $CSS), 0, 8));
        $node->setProperty('themeBackendCSS', $backendCSS);
        $node->setProperty(
            'themeWebmanifestThemeColor',
            $colors['themeWebmanifestTheme']
        );
        $node->setProperty('themeHeaderMarkup', $markup);

        return $CSS;
    }

    /**
     * Trigger generation of theme CSS if the theme settings have changed
     *
     * @param NodeInterface $node
     * @param string $propertyName
     * @param $oldValue
     * @param $newValue
     * @return void
     */
    public function update(
        NodeInterface $node,
        string $propertyName,
        $oldValue,
        $newValue
    ): void {
        $styleProperties = [
            // Rounded
            'themeRoundedBox',
            'themeRoundedImage',
            'themeRoundedButton',

            // Colors
            'themeColorScheme',
            'themeColorLightBackground',
            'themeColorLightText',
            'themeColorLightMain',
            'themeColorLightMinor',
            'themeColorLightMinor2',
            'themeColorLightHeader',
            'themeColorLightFooter',
            'themeColorDarkBackground',
            'themeColorDarkText',
            'themeColorDarkMain',
            'themeColorDarkMinor',
            'themeColorDarkMinor2',
            'themeColorDarkHeader',
            'themeColorDarkFooter',

            // Divider
            'themeHrSoft',
            'themeHrImage',
            'themeHrImageSize',
            'themeHrImagePosition',

            // Fonts
            'themeFontHeadline',
            'themeFontQuote',
            'themeFontButton',
            'themeFontMain',

            // ClipPath
            'themeClipPath',
            'themeClipPathInContent',
            'themeClipPathBelowNavigation',
            'themeClipPathAboveFooter',

            // Logo
            'themeLogoSize',
            'themeLogoSizeInContent',

            // Scroll indicator
            'themeScrollIndicatorRounded',
        ];
        $needCSS = in_array($propertyName, $styleProperties);
        if ($needCSS) {
            $this->generateCss($node);
        }

        $completeFlush = [
            // Clip path
            'themeClipPath',
            'themeClipPathInContent',
            'themeClipPathBelowNavigation',
            'themeClipPathAboveFooter',

            // Logo
            'themeLogoData',
            'themeLogoAsset',
            'themeLogoDataContent',
            'themeLogoAssetContent',
            'themeLogoSizeInContent',

            // Scroll indicator
            'themeScrollIndicatorIcon',
            'themeScrollIndicatorMarkup',
            'themeScrollIndicatorTheme',
            'themeScrollIndicatorSize',
            'themeScrollIndicatorBackground',

            // Colors scheme
            'themeColorScheme',
            'themeColorSchemeSwitchter',
        ];

        if (in_array($propertyName, $completeFlush)) {
            $this->contentCache->flush();
            return;
        }

        $headTagsProperties = [
            'themeFavicon',
            'themeWebmanifestThemeColor',
            'themeBrowserconfigTileColor',
            'themeWebmanifestName',
        ];
        if ($needCSS || in_array($propertyName, $headTagsProperties)) {
            $this->contentCache->flushByTag('Base_Style_HeadTags');
        }
    }
}
