import useRequest from "../../hooks/use-request"

const OrderIndex = ({ orders, currentUser })=>{
  const orderRows = orders
    .map(order => {
      return(
        <tr key={order.id}>
          <td>{order.ticket.title}</td>
          <td>{order.ticket.price}</td>
          <td>{order.status}</td>
        </tr>
      );
    });

    return(
      <div>
        <h1>Orders</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orderRows}
          </tbody>
        </table>
      </div>
    );
}

OrderIndex.getInitialProps = async (context, client)=>{
  const { data } = await client.get('/api/orders');

  return { orders: data };
}

export default OrderIndex;