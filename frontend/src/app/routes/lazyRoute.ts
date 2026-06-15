import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'

type LazyModule<T extends string> = Record<T, ComponentType>

export function lazyComponent<T extends string>(
  load: () => Promise<LazyModule<T>>,
  exportName: T,
): NonNullable<RouteObject['lazy']> {
  return async () => {
    const module = await load()

    return {
      Component: module[exportName],
    }
  }
}
