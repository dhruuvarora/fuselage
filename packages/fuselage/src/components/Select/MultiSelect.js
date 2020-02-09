import React, { useState, useRef, useEffect, useCallback } from 'react';

import { AnimatedVisibility, Box, Flex, Margins, Position } from '../Box';
import { Chip } from '../Chip';
import { Icon } from '../Icon';
import { InputBox } from '../InputBox';
import { Options, CheckOption, useCursor } from '../Options';
import { Focus, Addon } from './Select';

const Container = Box.extend('rcx-select', 'div');

const SelectedOptions = React.memo((props) => <Chip {...props}/>);

const prevent = (e) => e.preventDefault() & e.stopPropagation() & e.stopImmediatePropagation();
export const MultiSelect = ({
  value,
  filter,
  options = [],
  error,
  disabled,
  anchor: Anchor = Focus,
  onChange = () => {},
  getLabel = ([, label] = []) => label,
  getValue = ([value]) => value,
  placeholder,
  renderOptions: _Options = Options,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || []);

  const currentValue = value !== undefined ? value : internalValue;
  const option = options.find((option) => getValue(option) === currentValue);
  const index = options.indexOf(option);

  const internalChanged = ([value]) => {
    if (currentValue.includes(value)) {
      const newValue = currentValue.filter((item) => item !== value);
      setInternalValue(newValue);
      return onChange(newValue);
    }
    const newValue = [...currentValue, value];
    setInternalValue(newValue);
    return onChange(newValue);
  };


  const mapOptions = ([value, label]) => {
    if (currentValue.includes(value)) {
      return [value, label, true];
    }
    return [value, label];
  };
  const applyFilter = ([, option]) => !filter || ~option.toLowerCase().indexOf(filter.toLowerCase());
  const filteredOptions = options.filter(applyFilter).map(mapOptions);
  const [cursor, handleKeyDown, handleKeyUp, reset, [visible, hide, show]] = useCursor(index, filteredOptions, internalChanged);

  useEffect(reset, [filter]);

  const ref = useRef();
  const containerRef = useRef();
  return (
    <Container className={
      [
        error && 'invalid',
        disabled && 'disabled',
      ].filter(Boolean).join(' ')
    } ref={containerRef} onClick={() => ref.current.focus() & show()} disabled={disabled} {...props}>
      <Flex.Item grow={1}>
        <Margins inline='x4'>
          <Flex.Container>
            <Box is='div'>
              <Margins all='neg-x8'>
                <Chip.Wrapper role='listbox'>
                  <Anchor disabled={disabled} ref={ref} aria-haspopup='listbox' onClick={show} onBlur={hide} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} style={{ order: 1 }} mod-undecorated children={option || placeholder}/>
                  {currentValue.map((value) => <SelectedOptions role='option' key={value} onMouseDown={(e) => prevent(e) & internalChanged([value]) && false} children={getLabel(options.find(([val]) => val === value))}/>)}
                </Chip.Wrapper>
              </Margins>
            </Box>
          </Flex.Container>
        </Margins>
      </Flex.Item>
      <Flex.Item grow={0} shrink={0}>
        <Margins inline='x4'>
          <Addon children={<Icon name={ visible === AnimatedVisibility.VISIBLE ? 'cross' : 'arrow-down'} size='20' />}/>
        </Margins>
      </Flex.Item>
      <AnimatedVisibility visibility={visible}><Position anchor={containerRef}><_Options onMouseDown={prevent} multiple filter={filter} renderItem={CheckOption} role='listbox' options={filteredOptions} onSelect={internalChanged} cursor={cursor} /></Position></AnimatedVisibility>
    </Container>);
};

export const MultiSelectFiltered = ({
  options,
  placeholder,
  ...props
}) => {
  const [filter, setFilter] = useState('');
  const anchor = useCallback(React.forwardRef(({ children, filter, ...props }, ref) => <Flex.Item grow={1}><InputBox.Input ref={ref} placeholder={placeholder} value={filter} onInput={(e) => setFilter(e.currentTarget.value)} {...props} mod-undecorated={true}/></Flex.Item>), []);
  return <MultiSelect filter={filter} options={options} {...props} anchor={anchor}/>;
};