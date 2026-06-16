import type { CSSProperties, ReactNode } from 'react'

import styles from './Skeleton.module.css'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  circle?: boolean
  className?: string
  style?: CSSProperties
}

export function Skeleton({ width = '100%', height = 16, circle, className, style }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, circle ? styles.circle : '', className].filter(Boolean).join(' ')}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <Skeleton width={180} height={28} />
        <Skeleton width={260} height={14} />
      </div>
      {withAction && <Skeleton width={120} height={36} />}
    </div>
  )
}

function ListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.listRow}>
          <div className={styles.listRowMain}>
            <Skeleton width={`${55 + (index % 3) * 10}%`} height={16} />
            <Skeleton width={`${35 + (index % 2) * 15}%`} height={12} />
          </div>
          <Skeleton width={64} height={32} />
        </div>
      ))}
    </>
  )
}

type PageSkeletonProps = {
  children?: ReactNode
}

function PageSkeleton({ children }: PageSkeletonProps) {
  return <div className={styles.page}>{children}</div>
}

export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton />
      <section className="card">
        <div className="cardBody">
          <ListRowsSkeleton rows={rows} />
        </div>
      </section>
    </PageSkeleton>
  )
}

export function ListRowsOnlySkeleton({ rows = 5 }: { rows?: number }) {
  return <ListRowsSkeleton rows={rows} />
}

export function DashboardSkeleton() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton withAction={false} />
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`card ${styles.statCard}`}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="55%" height={28} />
            <Skeleton width="30%" height={12} />
          </div>
        ))}
      </div>
      <div className={styles.grid2}>
        {Array.from({ length: 4 }, (_, index) => (
          <section key={index} className="card">
            <div className="cardHeader">
              <Skeleton width={140} height={18} />
            </div>
            <div className="cardBody">
              <ListRowsSkeleton rows={3} />
            </div>
          </section>
        ))}
      </div>
    </PageSkeleton>
  )
}

export function DetailPageSkeleton() {
  return (
    <PageSkeleton>
      <Skeleton width={200} height={14} />
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Skeleton width={280} height={32} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Skeleton width={80} height={14} />
            <Skeleton width={60} height={14} />
            <Skeleton width={90} height={24} style={{ borderRadius: 999 }} />
          </div>
        </div>
        <Skeleton width={140} height={36} />
      </div>
      <div className={styles.pipeline}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.pipelineStep}>
            <Skeleton circle width={12} height={12} />
            <Skeleton width={56} height={10} />
          </div>
        ))}
      </div>
      <div className={styles.detailGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <section key={index} className="card">
            <div className="cardHeader">
              <Skeleton width={120} height={18} />
            </div>
            <div className="cardBody">
              <div className={styles.sectionBody}>
                {Array.from({ length: 4 }, (_, row) => (
                  <div key={row} className={styles.fieldRow}>
                    <Skeleton width="35%" height={14} />
                    <Skeleton width="40%" height={14} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </PageSkeleton>
  )
}

export function ContactDetailSkeleton() {
  return (
    <PageSkeleton>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Skeleton width={80} height={12} />
          <Skeleton width={220} height={32} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width={120} height={36} />
          <Skeleton width={100} height={36} />
        </div>
      </div>
      <section className="card">
        <div className="cardBody">
          <div className={styles.sectionBody}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.fieldRow}>
                <Skeleton width="25%" height={14} />
                <Skeleton width="45%" height={14} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageSkeleton>
  )
}

export function FormPageSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <PageSkeleton>
      <section className="card">
        <div className={styles.formFields}>
          <Skeleton width={180} height={28} />
          {Array.from({ length: fields }, (_, index) => (
            <div key={index} className={styles.formField}>
              <Skeleton width={90} height={14} />
              <Skeleton width="100%" height={40} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Skeleton width={120} height={36} />
            <Skeleton width={100} height={36} />
          </div>
        </div>
      </section>
    </PageSkeleton>
  )
}

export function SettingsSkeleton() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton withAction={false} />
      <section className="card">
        <div className="cardBody">
          <div className={styles.sectionBody}>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className={styles.fieldRow}>
                <Skeleton width="25%" height={14} />
                <Skeleton width="35%" height={14} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageSkeleton>
  )
}

export function AuthSkeleton() {
  return (
    <div className={styles.authCard}>
      <div className={styles.headerText}>
        <Skeleton width={180} height={28} />
        <Skeleton width={240} height={14} />
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className={styles.formField}>
          <Skeleton width={80} height={14} />
          <Skeleton width="100%" height={40} />
        </div>
      ))}
      <Skeleton width="100%" height={40} />
    </div>
  )
}

export function AppBootstrapSkeleton() {
  return (
    <div className={styles.appBootstrap}>
      <aside className={styles.sidebar}>
        <Skeleton width={120} height={24} />
        <div className={styles.sidebarNav}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} width="100%" height={36} />
          ))}
        </div>
        <Skeleton width="100%" height={48} style={{ marginTop: 'auto' }} />
      </aside>
      <div className={styles.mainArea}>
        <div className={styles.topbar}>
          <Skeleton width={280} height={36} />
          <Skeleton width={200} height={36} />
        </div>
        <div className={styles.content}>
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  )
}
