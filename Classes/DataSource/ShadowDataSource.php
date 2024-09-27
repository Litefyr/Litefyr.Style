<?php

namespace Litefyr\Style\DataSource;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\I18n\EelHelper\TranslationHelper;

class ShadowDataSource extends AbstractDataSource
{
    #[Flow\Inject]
    protected ResourceManager $resourceManager;

    #[Flow\Inject]
    protected TranslationHelper $translationHelper;

    /**
     * @var array<string>
     */
    #[Flow\InjectConfiguration('shadows')]
    protected array $shadows;

    protected static $identifier = 'litefyr-style-shadow';

    /**
     * @param NodeInterface $node The node that is currently edited (optional)
     * @param array $arguments Additional arguments (key / value)
     * @return array<int<0,max>,array{value:string,label:string}>
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $sortedKeys = array_keys($this->shadows);
        $options = array_fill_keys($sortedKeys, null);
        $disabled = [];

        foreach ($arguments as $key => $value) {
            $key = (string) $key;
            if ($value === 'true' || $value === true) {
                continue;
            }

            // If the value is just disabled, continue
            if (!$this->hasValue($value)) {
                $disabled[] = $key;
                continue;
            }

            // Ad the value to the options
            $options[$key] = [
                'value' => $value,
                'label' => $this->getLabel($key),
            ];
        }

        foreach ($this->shadows as $key => $value) {
            $key = (string) $key;
            if (in_array($key, $disabled) || !$this->hasValue($value) || $options[$key]) {
                continue;
            }
            $options[$key] = [
                'value' => $key,
                'label' => $this->getLabel($key),
            ];
        }

        return array_values(array_filter($options));
    }

    /**
     * Check if the value is set
     *
     * @param string $value
     * @return bool
     */
    protected function hasValue($value): bool
    {
        return $value && $value != 'false' && $value != 'null';
    }

    /**
     * Get the label for the shadow
     *
     * @param string $key
     * @return string
     */
    protected function getLabel(string $key): string
    {
        return $this->translationHelper->translate(
            'value.' . $key,
            $key,
            [$key],
            'NodeTypes/Mixin/Visuals/Shadows',
            'Litefyr.Style'
        ) ?? $key;
    }
}
