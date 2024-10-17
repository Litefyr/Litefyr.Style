<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Litefyr\Style\Service\ColorDataSourceService;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;

class SchemeDataSource extends AbstractDataSource
{
    protected static $identifier = 'litefyr-style-scheme';

    #[Flow\Inject]
    protected ColorDataSourceService $colorDataSourceService;

    /**
     * @param NodeInterface $node The node that is currently edited
     * @param array $arguments Additional arguments (key / value)
     * @return array
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        if (!isset($arguments['scheme'])) {
            return $arguments;
        }
        $scheme = $arguments['scheme'];
        $choosenScheme = $this->colorDataSourceService->getScheme($node);
        $choosenScheme = explode(' ', $choosenScheme);

        if (in_array($scheme, $choosenScheme)) {
            if (isset($arguments['returnNumberOfSchemes']) && $arguments['returnNumberOfSchemes'] == true) {
                return count($choosenScheme);
            }
            if (isset($arguments['return'])) {
                return $this->replaceSchemeRecuresive($arguments['return'], $scheme);
            }
            return [];
        }

        return [
            'hidden' => true,
        ];
    }

    /**
     * @param mixed $arguments
     * @param string $scheme
     * @return array
     */
    private function replaceSchemeRecuresive($arguments, string $scheme)
    {
        if (!isset($arguments)) {
            return [];
        }
        if (!is_iterable($arguments)) {
            return str_replace('{scheme}', $scheme, $arguments);
        }

        foreach ($arguments as $key => $value) {
            $arguments[$key] = $this->replaceSchemeRecuresive($value, $scheme);
        }
        return $arguments;
    }
}
