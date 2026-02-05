'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Button from '../../../../src/container/ui-elements/Button';
import Alerts from '../../../../src/container/ui-elements/Alerts';
import Modals from '../../../../src/container/ui-elements/Modals';
import Cards from '../../../../src/container/ui-elements/Cards';
import Grid from '../../../../src/container/ui-elements/Grid';
import Tabs from '../../../../src/container/ui-elements/Tabs';
import Breadcrumb from '../../../../src/container/ui-elements/Breadcrumb';
import List from '../../../../src/container/ui-elements/List';
import Pagination from '../../../../src/container/ui-elements/Pagination';
import PageHeaders from '../../../../src/container/ui-elements/PageHeaders';
import Steps from '../../../../src/container/ui-elements/Steps';
import Comments from '../../../../src/container/ui-elements/Comments';
import Empty from '../../../../src/container/ui-elements/Empty';
import Statistic from '../../../../src/container/ui-elements/Statistic';
import Rate from '../../../../src/container/ui-elements/Rate';
import Slider from '../../../../src/container/ui-elements/Slider';
import Progress from '../../../../src/container/ui-elements/Progress';
import Tags from '../../../../src/container/ui-elements/Tags';
import Dropdown from '../../../../src/container/ui-elements/Dropdown';
import Popover from '../../../../src/container/ui-elements/Popover';
import Timeline from '../../../../src/container/ui-elements/Timeline';
import Drawer from '../../../../src/container/ui-elements/Drawer';
import Notification from '../../../../src/container/ui-elements/Notification';
import Result from '../../../../src/container/ui-elements/Result';
import Spin from '../../../../src/container/ui-elements/Spin';
import Carousel from '../../../../src/container/ui-elements/Carousel';
import Collapse from '../../../../src/container/ui-elements/Collapse';
import Avatar from '../../../../src/container/ui-elements/Avata';
import Badge from '../../../../src/container/ui-elements/Badge';
import AutoComplete from '../../../../src/container/ui-elements/AutoComplete';
import Checkbox from '../../../../src/container/ui-elements/Checkbox';
import Cascader from '../../../../src/container/ui-elements/Cascader';
import DatePicker from '../../../../src/container/ui-elements/DatePicker';
import Radio from '../../../../src/container/ui-elements/Radio';
import Switch from '../../../../src/container/ui-elements/Switch';
import Select from '../../../../src/container/ui-elements/Select';
import Timepicker from '../../../../src/container/ui-elements/Timepicker';
import TreeSelect from '../../../../src/container/ui-elements/TreeSelect';
import Calender from '../../../../src/container/ui-elements/Calender';
import Form from '../../../../src/container/ui-elements/Form';
import Skeleton from '../../../../src/container/ui-elements/Skeleton';
import Inputs from '../../../../src/container/ui-elements/Inputs';
import Messages from '../../../../src/container/ui-elements/Messages';
import PopConfirme from '../../../../src/container/ui-elements/PopConfirme';
import Menu from '../../../../src/container/ui-elements/Menu';
import Upload from '../../../../src/container/ui-elements/Upload';
import DragAndDrop from '../../../../src/container/ui-elements/DragAndDrop';
import DashboardBase from '../../../../src/container/dashboard/DashboardBase';

// Component map for lookup
const components = {
  button: Button,
  alerts: Alerts,
  modals: Modals,
  cards: Cards,
  grid: Grid,
  tabs: Tabs,
  breadcrumb: Breadcrumb,
  list: List,
  pagination: Pagination,
  'page-headers': PageHeaders,
  steps: Steps,
  comments: Comments,
  empty: Empty,
  statistic: Statistic,
  rate: Rate,
  slider: Slider,
  progress: Progress,
  tags: Tags,
  dropdown: Dropdown,
  popover: Popover,
  timeline: Timeline,
  drawer: Drawer,
  notification: Notification,
  result: Result,
  spiner: Spin,
  carousel: Carousel,
  collapse: Collapse,
  avatar: Avatar,
  badge: Badge,
  'auto-complete': AutoComplete,
  checkbox: Checkbox,
  cascader: Cascader,
  'date-picker': DatePicker,
  radio: Radio,
  switch: Switch,
  select: Select,
  timePicker: Timepicker,
  'tree-select': TreeSelect,
  calendar: Calender,
  form: Form,
  skeleton: Skeleton,
  input: Inputs,
  message: Messages,
  confirm: PopConfirme,
  menu: Menu,
  upload: Upload,
  drag: DragAndDrop,
  base: DashboardBase,
};

function ComponentsRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  const Component = components[slug];
  
  if (!Component) {
    return <div>Component not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(ComponentsRoutesPage);

