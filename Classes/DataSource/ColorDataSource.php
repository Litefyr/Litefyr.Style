<?php

namespace Litefyr\Style\DataSource;

use Litefyr\Style\Service\ColorDataSourceService;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;

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
        $fQ = new FlowQuery([$node]);

        $alwaysShow = false;

        if (isset($arguments['alwaysShow'])) {
            $alwaysShow = $arguments['alwaysShow'] == 'true';
            unset($arguments['alwaysShow']);
        }

        if (
            $alwaysShow == false &&
            ($fQ->parent('[instanceof Litefyr.Integration:Mixin.ThemeSelector.HideOnChildren]')->is() ||
                $fQ->closest('[instanceof Litefyr.Integration:Mixin.ThemeSelector.HideBelow]')->is())
        ) {
            return [
                'hidden' => true,
            ];
        }

        return $this->colorDataSourceService->getData('color', $node, $arguments);
    }
}
