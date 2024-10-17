<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Litefyr\Style\Service\ColorDataSourceService;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;

class ColorDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-color';

    #[Flow\Inject]
    protected ColorDataSourceService $colorDataSourceService;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        return $this->colorDataSourceService->getData('color', $node, $arguments);
    }
}
