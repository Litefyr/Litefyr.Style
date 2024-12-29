<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class RoundedService
{
    #[Flow\InjectConfiguration('default.rounded')]
    protected int $default;

    const FULL_ROUND = '9999px';

    /**
     * Return rounded values for different elements.
     *
     * @param NodeInterface $node
     * @return array
     */
    public function getRoudedValues(NodeInterface $node): array
    {
        $rounded = [
            'box' => $node->getProperty('themeRoundedBox') ?? $this->default,
            'image' => $node->getProperty('themeRoundedImage') ?? $this->default,
            'button' => $node->getProperty('themeRoundedButton') ?? $this->default,
            'input' => $node->getProperty('themeRoundedInput') ?? $this->default,
            'scroller' => $node->getProperty('themeScrollIndicatorRounded') ?? $this->default,
        ];

        $root = '';

        foreach ($rounded as $key => $value) {
            $root .= sprintf('--rounded-%s:%s;', $key, $value);
            if ($key == 'image') {
                $roundImage = $value == self::FULL_ROUND || str_contains($value, ' / ');
                $node->setProperty('themeRoundImage', $roundImage);
            }
        }

        return [
            'CSS' => [
                'root' => $root,
            ],
        ];
    }
}
