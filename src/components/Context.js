import React, { Component } from 'react';
import items from '../data';
import PropTypes from 'prop-types';

export const Context = React.createContext();
export const { Provider, Consumer } = Context;

export default class RoomProvider extends Component {
  state = {
    rooms: [],
    sortedRooms: [],
    featuredRooms: [],
    loading: true,
    type: 'all',
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false,
  };

  componentDidMount() {
    // format data for Contentful CMS
    const rooms = this.formatData(items);
    const featuredRooms = rooms.filter(room => room.featured === true);
    const maxPrice = Math.max(...rooms.map(item => item.price));
    const maxSize = Math.max(...rooms.map(item => item.size));

    this.setState(() => ({
      rooms,
      featuredRooms,
      sortedRooms: rooms,
      loading: false,
      price: maxSize,
      maxPrice,
      maxSize,
    }));
  }

  formatData = items => {
    const tempItems = items.map(item => {
      const id = item.sys.id;
      const images = item.fields.images.map(image => image.fields.file.url);
      /* the new images property from the rooms object will overwrite the original property destructured by ...items.fields. Instead of an array with objects it now has a url string as a value */
      const room = { ...item.fields, images, id };
      return room;
    });
    return tempItems;
  };

  getRoom = slug => {
    const tempRooms = [...this.state.rooms];
    const room = tempRooms.find(room => room.slug === slug);
    return room;
  };

  handleChange = e => {
    const target = e.target;
    const name = e.target.name;
    const value = e.type === 'checkbox' ? target.checked : target.value;
    this.setState(() => ({ [name]: value }), this.filterRooms);
  };

  filterRooms = () => {
    const {
      rooms,
      type,
      capacity,
      price,
      minSize,
      maxSize,
      breakfast,
      pets,
    } = this.state;
    let tempRooms = [...rooms];
    if (type !== 'all') {
      tempRooms = tempRooms.filter(room => room.type === type);
    }
    this.setState({ sortedRooms: tempRooms });
  };

  render() {
    return (
      <Provider
        value={{
          ...this.state,
          getRoom: this.getRoom,
          handleChange: this.handleChange,
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}

export function withConsumer(Component) {
  return function ConsumerWrapper(props) {
    return (
      <Consumer>{value => <Component {...props} context={value} />}</Consumer>
    );
  };
}

Provider.propTypes = {
  value: PropTypes.shape({
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        breakfast: PropTypes.bool.isRequired,
        capacity: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired,
        extras: PropTypes.arrayOf(PropTypes.string).isRequired,
        featured: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(PropTypes.string).isRequired,
        name: PropTypes.string.isRequired,
        pets: PropTypes.bool.isRequired,
        price: PropTypes.number.isRequired,
        size: PropTypes.number.isRequired,
        slug: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    sortedRooms: PropTypes.arrayOf(PropTypes.object).isRequired,
    featuredRooms: PropTypes.arrayOf(PropTypes.object).isRequired,
    getRoom: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
  }).isRequired,
};

RoomProvider.propTypes = {
  children: PropTypes.element,
};
