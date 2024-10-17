<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Litefyr\Style\Service\ColorDataSourceService;

class ColorpickerDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-colorpicker';

    #[Flow\Inject]
    protected ColorDataSourceService $colorDataSourceService;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $scheme = $arguments['scheme'] ?? null;
        if (!$scheme || !in_array($scheme, ['light', 'dark'])) {
            return [
                'hidden' => true,
            ];
        }

        $options = $this->colorDataSourceService->getData('colorpicker', $node, $arguments, $scheme);

        if (empty($options)) {
            return [
                'hidden' => true,
            ];
        }

        return $options;
    }
}
