<?php

namespace Litespeed\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class RoundedService
{
    #[Flow\InjectConfiguration('default.rounded')]
    protected int $default;

    const FULL_ROUND = '9999px';

    /**
     * Return roun
     *
     * @param NodeInterface $node
     * @return array
     */
    public function getRoudedValues(NodeInterface $node): array
    {
        $rounded = [
            'box' => $this->getValue($node, 'themeRoundedBox'),
            'image' => $this->getValue($node, 'themeRoundedImage'),
            'button' => $this->getValue($node, 'themeRoundedButton'),
            'scroller' => $this->getValue($node, 'themeScrollIndicatorRounded'),
        ];
        $CSS = '';
        foreach ($rounded as $key => $value) {
            $CSS .= $this->getCSSProperty($key, $value);
        }
        return [
            'rounded' => $rounded,
            'CSS' => [
                'root' => $CSS,
            ],
        ];
    }

    /**
     * Get value from node, fallback to default. Check if the value is full rounded or not, and return string value
     *
     * @param NodeInterface $node
     * @param string $property
     * @return string
     */
    protected function getValue(NodeInterface $node, string $property): string
    {
        $value = $node->getProperty($property) ?? $this->default;

        // The value 26 means full rounded
        if ($value >= 26) {
            return self::FULL_ROUND;
        }
        return sprintf('%srem', $value / 16);
    }

    /**
     * Create CSS property from key and value. If the value is full round, add an additional property with full round-$key
     *
     * @param string $key
     * @param string $value
     * @return string
     */
    protected function getCSSProperty(string $key, string $value): string
    {
        $CSS = sprintf('--rounded-%s:%s;', $key, $value);
        if ($value == self::FULL_ROUND) {
            return sprintf('--round-%s:1;%s', $key, $CSS);
        }
        return $CSS;
    }
}
