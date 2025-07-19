import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
