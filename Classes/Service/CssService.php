<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\Core\Cache\ContentCache;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Litefyr\Style\Service\FontService;
use Litefyr\Style\Service\ClipPathService;
use Litefyr\Style\Service\DividerService;
use Litefyr\Style\Service\ColorService;
use Litefyr\Style\Service\LogoService;
use Litefyr\Style\Service\OpacityService;
use Litefyr\Style\Service\RoundedService;
use Litefyr\Style\Service\ShadowService;

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

    #[Flow\Inject]
    protected ShadowService $shadowService;

    #[Flow\Inject]
    protected OpacityService $opacityService;

    /**
     * Generate dynamic CSS
     *
     * @param NodeInterface $node
     * @return string|null
     */
    public function generateCss(NodeInterface $node): ?string
    {
        if (!$node->getNodeType()->isOfType('Litefyr.Integration:Document.HomePage')) {
            return null;
        }

        // Get values from the site
        $colors = $this->colorService->getColors($node);
        $fonts = $this->fontService->getFonts($node);
        $clipPath = $this->clipPathService->getClipPath($node);
        $rounded = $this->roundedService->getRoudedValues($node);
        $divider = $this->dividerService->getDivider($node);
        $logo = $this->logoService->getLogoSizes($node);
        $shadow = $this->shadowService->getShadows($node);
        $opacities = $this->opacityService->getOpacities($node);

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
        foreach ([$fonts, $colors, $clipPath, $rounded, $divider, $logo, $shadow, $opacities] as $value) {
            if (isset($value['markup'])) {
                $markup .= $value['markup'];
            }
            if (isset($value['CSS'])) {
                foreach (['onStart', 'root', 'light', 'dark', 'onEnd', 'backend'] as $key) {
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
            $CSS .= sprintf(':root{%s%s}', $cssObject['light'], $cssObject['dark']);
        }
        $CSS .= $cssObject['onEnd'];

        $backendCSS = sprintf(':root{%s}', $cssObject['backend']);

        // Set properties
        $node->setProperty('themeCSS', $CSS);
        $node->setProperty('themeCSSHash', substr(hash('sha256', $CSS), 0, 8));
        $node->setProperty('themeBackendCSS', $backendCSS);
        $node->setProperty('colorThemeMeta', $colors['colorThemeMeta']);
        $node->setProperty('themeHeaderMarkup', $markup);

        return $CSS;
    }

    /**
     * Trigger generation of theme CSS if the theme settings have changed
     *
     * @param NodeInterface $node
     * @param string $propertyName
     * @param mixed $oldValue
     * @param mixed $newValue
     * @return void
     */
    public function update(NodeInterface $node, string $propertyName, $oldValue, $newValue): void
    {
        $styleProperties = [
            //Shadows
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

            // Opacities
            'themeOpacityImageWithTextOverlay',

            // Rounded
            'themeRoundedBox',
            'themeRoundedImage',
            'themeRoundedButton',
            'themeRoundedInput',

            // Colors
            'themeColorScheme',
            'themeColorLight',
            'themeColorLightMain',
            'themeColorLightMinor',
            'themeColorLightMinor2',
            'themeColorLightHeader',
            'themeColorLightFooter',
            'themeColorDark',
            'themeColorDarkMain',
            'themeColorDarkMinor',
            'themeColorDarkMinor2',
            'themeColorDarkHeader',
            'themeColorDarkFooter',
            'themeColorContrastThreshold',
            'themeColorContrastLightnessMin',
            'themeColorContrastLightnessMax',

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

        $headTagsProperties = ['themeFaviconSvg', 'themeFaviconPng'];
        if ($needCSS || in_array($propertyName, $headTagsProperties)) {
            $this->contentCache->flushByTag('Style_HeadTags');
        }
    }
}
