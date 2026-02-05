import { useMemo } from 'react';
import { Button } from '../../../../components/buttons/buttons';
import FeatherIcon from 'feather-icons-react';
import Heading from '../../../../components/heading/heading';
import { FigureWizards } from '../Style';

/**
 * Custom hook for processing cart data into table format
 * Converts cart data into table dataSource and calculates totals
 */
export const useCartTableData = (cartData) => {
  const { dataSource, subtotal, columns } = useMemo(() => {
    const tableDataSource = [];
    let cartSubtotal = 0;

    if (cartData && cartData.length > 0) {
      cartData.forEach((item) => {
        const { id, img, name, quantity, price, size, color } = item;
        cartSubtotal += parseInt(quantity, 10) * parseInt(price, 10);

        tableDataSource.push({
          key: id,
          product: (
            <div className="cart-single">
              <FigureWizards>
                <img className="w-80px" src={require(`../../../../${img}`)} alt="" />
                <figcaption>
                  <div className="cart-single__info">
                    <Heading as="h6">{name}</Heading>
                    <ul className="info-list">
                      <li>
                        <span className="info-title">Size :</span>
                        <span>{size}</span>
                      </li>
                      <li>
                        <span className="info-title"> Color :</span>
                        <span>{color}</span>
                      </li>
                    </ul>
                  </div>
                </figcaption>
              </FigureWizards>
            </div>
          ),
          price: <span className="cart-single-price">${price}</span>,
          quantity: (
            <div className="cart-single-quantity">
              <Button onClick={() => decrementUpdate(id, quantity)} className="btn-dec" type="default">
                <FeatherIcon icon="minus" size={12} />
              </Button>
              {quantity}
              <Button onClick={() => incrementUpdate(id, quantity)} className="btn-inc" type="default">
                <FeatherIcon icon="plus" size={12} />
              </Button>
            </div>
          ),
          total: <span className="cart-single-t-price">${quantity * price}</span>,
          action: (
            <div className="table-action">
              <Button
                onClick={() => cartDeleted(id)}
                className="btn-icon"
                to="#"
                size="default"
                type="danger"
                shape="circle"
                transparented
              >
                <FeatherIcon icon="trash-2" size={16} />
              </Button>
            </div>
          ),
        });
      });
    }

    const tableColumns = [
      {
        title: 'Product',
        dataIndex: 'product',
        key: 'product',
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
      },
    ];

    return {
      dataSource: tableDataSource,
      subtotal: cartSubtotal,
      columns: tableColumns,
    };
  }, [cartData]);

  return {
    dataSource,
    subtotal,
    columns,
  };
};

