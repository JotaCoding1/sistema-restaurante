// Interface pública do módulo orders
export { router as ordersRouter } from "./orders.routes.js";
export {
  ORDER_STATUS,
  createOrder,
  getOrder,
  listOrders,
  listOrdersBySession,
  markDelivered,
  setOrderStatus
} from "./orders.service.js";