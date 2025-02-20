import { NextPage, GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import { useRouter } from 'next/router'

import { AreaType } from '../../js/types'
import { graphqlClient } from '../../js/graphql/Client'
import Layout from '../../components/layout'
import SeoTags from '../../components/SeoTags'
import BreadCrumbs from '../../components/ui/BreadCrumbs'
import AreaMap from '../../components/area/areaMap'
import { useMemo, useState } from 'react'
import SidePanel from '../../components/area/panel/sidePanel'
import { getSlug } from '../../js/utils'
import { getNavBarOffset } from '../../components/Header'
import PhotoMontage from '../../components/media/PhotoMontage'
interface AreaPageProps {
  area: AreaType
}

const Area: NextPage<AreaPageProps> = ({ area }) => {
  const router = useRouter()
  return (
    <Layout
      showFooter={false}
      showFilterBar={false}
      contentContainerClass='content-default'
    >
      {router.isFallback
        ? (
          <div className='px-4 max-w-screen-md'>
            <div>Loading...</div>
          </div>
          )
        : <Body area={area} />}
    </Layout>
  )
}

export default Area

const Body = ({ area }: AreaPageProps): JSX.Element => {
  const [focused, setFocused] = useState<null | string>(null)
  const [selected, setSelected] = useState<null | string>(null)
  const navbarOffset = getNavBarOffset()

  const items = useMemo(() => {
    return area.children
      // We don't care about empty children
      .filter(i => i.totalClimbs > 0)
      // map the actual data we need into the item entity
      .map(child => ({
        id: child.id,
        name: child.areaName,
        description: child.content?.description,
        totalClimbs: child.totalClimbs,
        aggregate: child.aggregate,
        content: child.content,
        href: getSlug(child.metadata.areaId, child.metadata.leaf)
      }))
  }, [area])

  const { areaName, children, metadata, content, pathTokens, ancestors, media } = area
  return (
    <>
      <SeoTags
        keywords={[areaName]}
        title={areaName}
        description={content.description}
      />

      <div
        className='flex overflow-y-auto'
        style={{ height: `calc(100vh - ${navbarOffset}px)` }}
      >
        <div
          className='p-6 flex-1 overflow-y-auto'
          style={{
            height: `calc(100vh - ${navbarOffset}px)`,
            scrollSnapType: 'y mandatory'
          }}
        >
          <div className='snap-start pt-4'>
            <BreadCrumbs ancestors={ancestors} pathTokens={pathTokens} />
            <div className='mt-4' />
            <PhotoMontage isHero photoList={media} />
          </div>
          <div className='mt-16 snap-start'>
            <SidePanel
              onFocus={d => setFocused(d)}
              onSelect={d => setSelected(d)}
              items={items}
              selected={selected}
              focused={focused}
              title={areaName}
              description={content.description}
              longitude={metadata.lng}
              latitude={metadata.lat}
            />
          </div>
        </div>

        <div className='md:1-1/4 lg:w-1/2'>
          <AreaMap
            focused={focused}
            selected={selected}
            subAreas={children}
            area={area}
          />
        </div>
      </div>
    </>
  )
}

// This function gets called at build time.
// Nextjs uses the result to decide which paths will get pre-rendered at build time
export async function getStaticPaths (): Promise<any> {
  // Temporarily disable pre-rendering
  // https://github.com/OpenBeta/openbeta-graphql/issues/26
  // const rs = await graphqlClient.query<AreaResponseType>({
  //   query: gql`query EdgeAreasQuery($filter:Filter) {
  //   areas(filter: $filter) {
  //     area_name
  //     metadata {
  //       area_id
  //     }
  //   }
  // }`,
  //   variables: {
  //     filter: { leaf_status: { isLeaf: false } }
  //   }
  // })

  // // Get the paths we want to pre-render based on posts
  // const paths = rs.data.areas.map((area: AreaType) => ({
  //   params: { id: area.metadata.area_id }
  // }))

  // We'll pre-render only these paths at build time.
  // { fallback: true } means render on first reques for those that are not in `paths`
  return {
    paths: [
      { params: { id: 'bea6bf11-de53-5046-a5b4-b89217b7e9bc' } },
      { params: { id: 'decc1251-4a67-52b9-b23f-3243e10e93d0' } },
      { params: { id: '78da26bc-cd94-5ac8-8e1c-815f7f30a28b' } }
    ],
    fallback: true
  }
}

// This also gets called at build time
// Query graphql api for area by id
export const getStaticProps: GetStaticProps<AreaPageProps, {id: string}> = async ({ params }) => {
  if (params == null || params.id == null) {
    return {
      notFound: true
    }
  }

  const query = gql`query getAreaById($uuid: ID) {
    area(uuid: $uuid) {
      id
      uuid
      areaName
      ancestors
      pathTokens
      metadata {
        lat
        lng 
        leaf
        bbox
        areaId
      } 
      content {
        description 
      } 
      aggregate {
          byGradeBand {
            intermediate
            expert
            beginner
            advance
          }
          byDiscipline {
            sport {
              total
            }
            trad {
              total
            }
            boulder {
              total
            }
          }
        }
      children {
        id
        uuid
        areaName
        aggregate {
          byGradeBand {
            intermediate
            expert
            beginner
            advance
          }
          byDiscipline {
            sport {
              total
            }
            trad {
              total
            }
            boulder {
              total
            }
          }
        }
        totalClimbs
        content {
          description 
        } 
        metadata {
          areaId
          leaf
          lat
          lng
        }
      }

      media {
        mediaUrl
        mediaUuid
      }
    }
  }`

  try {
    const rs = await graphqlClient.query<{area: AreaType}>({
      query,
      variables: {
        uuid: params.id
      }
    })
    if (rs.data.area == null) {
      return {
        notFound: true
      }
    }
    // Pass Area data to the page via props
    return {
      props: {
        area: rs.data.area
      }
    }
  } catch (e) {
    console.log('GraphQL exception:', e)
    return {
      notFound: true
    }
  }
}
