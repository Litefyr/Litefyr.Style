<?php

namespace Litefyr\Style;

use Litefyr\Style\Service\CssService;
use Litefyr\Style\Service\CodePenService;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Package\Package as BasePackage;

class Package extends BasePackage
{
    /**
     * @param Bootstrap $bootstrap The current bootstrap
     * @return void
     */
    public function boot(Bootstrap $bootstrap): void
    {
        $dispatcher = $bootstrap->getSignalSlotDispatcher();
        $dispatcher->connect(Node::class, 'nodePropertyChanged', CssService::class, 'update');

        $dispatcher->connect(Workspace::class, 'afterNodePublishing', CodePenService::class, 'afterNodePublishing');
    }
}
