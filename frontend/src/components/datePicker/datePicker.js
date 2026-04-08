// eslint-disable-next-line max-classes-per-file
import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker, defaultStaticRanges, defaultInputRanges } from 'react-date-range';
import { DatePicker } from 'antd';
import { ItemWraper, ButtonGroup } from './style';
import { Button } from '../buttons/buttons';

const ptBRShort = {
  ...ptBR,
  localize: {
    ...ptBR.localize,
    day: (n, opts) => {
      const base = ptBR.localize.day(n, opts);
      return base.slice(0, 3);
    },
  },
};

const translatedStaticRanges = defaultStaticRanges.map(range => {
  switch (range.label) {
    case 'Today':
      return { ...range, label: 'Hoje' };
    case 'Yesterday':
      return { ...range, label: 'Ontem' };
    case 'This Week':
      return { ...range, label: 'Esta semana' };
    case 'Last Week':
      return { ...range, label: 'Semana passada' };
    case 'This Month':
      return { ...range, label: 'Este mês' };
    case 'Last Month':
      return { ...range, label: 'Mês passado' };
    default:
      return range;
  }
});

const translatedInputRanges = defaultInputRanges.map(range => {
  switch (range.label) {
    case 'days up to today':
      return { ...range, label: 'dias até hoje' };
    case 'days starting today':
      return { ...range, label: 'dias a partir de hoje' };
    default:
      return range;
  }
});

const DateRangePickerOne = () => {
  const [state, setState] = useState({
    datePickerInternational: null,
    dateRangePicker: {
      selection: {
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        key: 'selection',
      },
    },
  });

  const handleRangeChange = which => {
    setState({
      ...state,
      dateRangePicker: {
        ...state.dateRangePicker,
        ...which,
      },
    });
  };

  const { dateRangePicker } = state;
  const start = dateRangePicker.selection.startDate.toString().split(' ');
  const end = dateRangePicker.selection.endDate.toString().split(' ');

  return (
    <ItemWraper>
      <DateRangePicker
        onChange={handleRangeChange}
        showSelectionPreview
        moveRangeOnFirstSelection={false}
        className="PreviewArea"
        months={2}
        ranges={[dateRangePicker.selection]}
        direction="horizontal"
        locale={ptBRShort}
        staticRanges={translatedStaticRanges}
        inputRanges={translatedInputRanges}
      />

      <ButtonGroup>
        <p>
          {`${format(dateRangePicker.selection.startDate, "dd 'de' MMMM yyyy", {
            locale: ptBR,
          })} - ${format(dateRangePicker.selection.endDate, "dd 'de' MMMM yyyy", {
            locale: ptBR,
          })}`}
        </p>
        <Button size="small" type="primary">
          Aplicar
        </Button>
        <Button size="small" type="white" outlined>
          Cancelar
        </Button>
      </ButtonGroup>
    </ItemWraper>
  );
};

class CustomDateRange extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  disabledStartDate = startValue => {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value);
  };

  onEndChange = value => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };

  render() {
    const { startValue, endValue, endOpen } = this.state;

    return (
      <div>
        <DatePicker
          disabledDate={this.disabledStartDate}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={startValue}
          placeholder="Início"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          style={{ margin: '5px' }}
        />

        <DatePicker
          disabledDate={this.disabledEndDate}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={endValue}
          placeholder="Fim"
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
          style={{ margin: '5px' }}
        />
      </div>
    );
  }
}

export { DateRangePickerOne, CustomDateRange };
