DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Guests or self can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
CREATE POLICY "Insert items for accessible orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id IS NULL OR o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );