import React from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';
import {
  Table,
  Grid,
  Segment,
  Container,
  Header,
  Label,
  Button,
} from 'semantic-ui-react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Link from '../../components/Link';
import semantic from '!!isomorphic-style-loader!css-loader!../../../node_modules/semantic-ui-css/semantic.css'; // eslint-disable-line

class Scan extends React.Component {
  static propTypes = {
    scan: PropTypes.shape({
      category: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      machines: PropTypes.arrayOf(
        PropTypes.shape({
          dns_name: PropTypes.string.isRequired,
          hostname: PropTypes.string.isRequired,
          id: PropTypes.number.isRequired,
          ip_address: PropTypes.string.isRequired,
          mac_address: PropTypes.string.isRequired,
          operating_system: PropTypes.string.isRequired,
          scan_id: PropTypes.number.isRequired,
          servicePorts: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.number.isRequired,
              machine_id: PropTypes.number.isRequired,
              port_number: PropTypes.number.isRequired,
              protocol: PropTypes.string.isRequired,
              service: PropTypes.string,
            }),
          ).isRequired,
        }),
      ).isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRow: null,
      scan: props.scan,
    };
  }

  getMachineIndex = id => this.state.machines.map(m => m.id).indexOf(id);

  handleRowClick = machine =>
    this.setState({ ...this.state, selectedRow: machine });

  labelColor = risk => {
    const colors = ['blue', 'green', 'yellow', 'red', 'purple'];
    return colors[risk];
  };

  renderPortList = () =>
    <Table
      // toggle selectable only when scan is not loading or when machine is selected
      selectable={
        !(!this.state.scan || this.state.scan.fetchLoading) ||
        !!this.state.selectedRow
      }
      compact
      basic="very"
      size="small"
      textAlign="center"
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Port Number</Table.HeaderCell>
          <Table.HeaderCell>Protocol</Table.HeaderCell>
          <Table.HeaderCell>Service</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {this.renderPortEntries()}
      </Table.Body>
    </Table>;

  renderPortEntries = () => {
    if (!this.state.selectedRow) {
      return (
        <Table.Row>
          <Table.Cell colSpan="3">Select a machine first.</Table.Cell>
        </Table.Row>
      );
    }
    const { servicePorts } = this.state.selectedRow;
    if (servicePorts.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan="3">
            Selected Machine has no open ports.
          </Table.Cell>
        </Table.Row>
      );
    }
    return _map(servicePorts, port =>
      <Table.Row key={port.id}>
        <Table.Cell>
          {port.port_number}
        </Table.Cell>
        <Table.Cell>
          {port.protocol}
        </Table.Cell>
        <Table.Cell>
          {port.service}
        </Table.Cell>
      </Table.Row>,
    );
  };

  renderVulnerabilityList = () =>
    <Table
      // toggle selectable only when scan is not loading or when machine is selected
      selectable={
        !(!this.state.scan || this.state.scan.fetchLoading) ||
        !!this.state.selectedRow
      }
      compact
      basic="very"
      size="small"
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell>Title</Table.HeaderCell>
          <Table.HeaderCell>Count</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {this.renderVulnerabilityEntries()}
      </Table.Body>
    </Table>;

  renderVulnerabilityEntries = () => {
    if (!this.state.selectedRow) {
      return (
        <Table.Row textAlign="center">
          <Table.Cell colSpan="3">Select a machine first.</Table.Cell>
        </Table.Row>
      );
    }
    const { vulnerabilities } = this.state.selectedRow;
    if (vulnerabilities.length === 0) {
      return (
        <Table.Row textAlign="center">
          <Table.Cell colSpan="3">
            Selected Machine has no detected vulnerabilities.
          </Table.Cell>
        </Table.Row>
      );
    }
    const labelColor = risk => {
      const colors = ['blue', 'green', 'yellow', 'red', 'purple'];
      return colors[risk];
    };
    const style = {
      padding: ' .2em .4em',
      textAlign: 'center',
      marginLeft: '1em',
      boxSizing: 'border-box',
      height: '17px',
      width: '18px',
      lineHeight: '1.2',
    };
    return _map(vulnerabilities, vuln =>
      <Table.Row key={vuln.id}>
        <Table.Cell>
          <Label color={labelColor(vuln.risk_factor)} size="mini" style={style}>
            {vuln.risk_factor}
          </Label>
        </Table.Cell>
        <Table.Cell>
          <strong>
            {vuln.title}
          </strong>
        </Table.Cell>
        <Table.Cell>
          {vuln.count}
        </Table.Cell>
      </Table.Row>,
    );
  };

  renderMachineList = () =>
    <Table
      // toggle selectable only when scan is not loading or when machine is selected
      selectable={!(!this.state.scan || this.state.scan.fetchLoading)}
      compact
      basic="very"
      size="small"
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Hostname</Table.HeaderCell>
          <Table.HeaderCell>IP Address</Table.HeaderCell>
          <Table.HeaderCell>Operating System</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {this.renderMachineEntries()}
      </Table.Body>
    </Table>;

  renderMachineEntries = () => {
    const { machines } = this.state.scan;
    const { selectedRow } = this.state;

    return _map(machines, machine =>
      <Table.Row
        key={machine.id}
        active={selectedRow && selectedRow.id === machine.id}
        onClick={() => this.handleRowClick(machine)}
      >
        <Table.Cell>
          {machine.hostname}
        </Table.Cell>
        <Table.Cell>
          {machine.ip_address}
        </Table.Cell>
        <Table.Cell>
          {machine.operating_system}
        </Table.Cell>
      </Table.Row>,
    );
  };

  render() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment>
              <Header
                as="h4"
                icon="unordered list"
                content={`MACHINE LIST (${this.state.scan
                  ? this.state.scan.machines.length
                  : ''})`}
              />
              {this.renderMachineList()}
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment>
              <Container>
                <Header
                  as="h4"
                  icon="setting"
                  content={`OPEN PORTS (${this.state.selectedRow
                    ? this.state.selectedRow.servicePorts.length
                    : ''})`}
                />
                {this.renderPortList()}
              </Container>
            </Segment>
            <Segment>
              <Container>
                <Header
                  as="h4"
                  icon="heartbeat"
                  content={`VULNERABILITIES (${this.state.selectedRow
                    ? this.state.selectedRow.vulnerabilities.length
                    : ''})`}
                />
                {this.renderVulnerabilityList()}
                <Link to={`/scan/${this.state.scan.id}/vulnerabilities`}>
                  <Button compact size="tiny" fluid>
                    <span>Show All Vulnerabilities</span>
                  </Button>
                </Link>
              </Container>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withStyles(semantic)(Scan);
