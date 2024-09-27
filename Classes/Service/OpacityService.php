<?php

namespace Litefyr\Style\Service;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;

#[Flow\Scope('singleton')]
class OpacityService
{
    /**
     * Get shadows
     *
     * @param NodeInterface $node
     * @return array
     */
    public function getOpacities(NodeInterface $node): array
    {
        $config = [
            'image-with-text-overlay' => $node->getProperty('themeOpacityImageWithTextOverlay'),
        ];
        $customProperties = '';

        foreach ($config as $key => $value) {
            if (is_numeric($value)) {
                $customProperties .= sprintf('--opacity-%s:%s;', $key, $value / 100);
            }
        }

        return [
            'CSS' => [
                'root' => $customProperties,
            ],
        ];
    }
}
