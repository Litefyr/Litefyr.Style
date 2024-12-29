<?php

namespace Litefyr\Style\DataSource;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\EelHelper\TranslationHelper;

class ClipPathDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-has-clippath';

    #[Flow\Inject]
    protected TranslationHelper $translationHelper;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        /** @var NodeInterface $styleNode */
        $styleNode = (new FlowQuery([$node]))
            ->closest('[instanceof Litefyr.Style:Mixin.Visuals.ClipPath]')
            ->get(0);

        if (
            !$styleNode ||
            !$styleNode->getProperty('themeClipPathInContent') ||
            !$styleNode->getProperty('themeClipPathEnabled')
        ) {
            return [
                'hidden' => true,
            ];
        }

        return [
            [
                'value' => 'enable',
                'label' => $this->translationHelper->translate(
                    'enableClip',
                    'Enable wave',
                    [],
                    'NodeTypes.Mixin.Visuals.ClipPath',
                    'Litefyr.Style'
                ),
                'icon' => 'bars',
                'iconActive' => 'water',
            ],
        ];
    }
}
