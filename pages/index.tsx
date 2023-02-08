import Head from 'next/head'
import { useState, forwardRef } from 'react'
import { DragDropContext, Draggable, Droppable, resetServerContext } from 'react-beautiful-dnd'
import styled from 'styled-components'
import useStrictDroppable from '../hooks/useStrictDroppable'
import { v4 as uuidv4 } from 'uuid';

const ItemContainer = styled.div`
border: 1px dotted black;
`

const DropArea = styled.div`
border: 1px dashed black;
`

const Item = ({ children, id, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {provided => {
        return <ItemContainer
          className="DraggableItem"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >{children}</ItemContainer>
      }}
    </Draggable>
  )
}

const DraggableList = ({ id, data, ...props }) => {
  return <div {...props}>
    {data.map((item, index) => {
      return <Item key={item.id} id={item.id} index={index}>{item.text}</Item>
    })}
  </div>
}


const DragDroppableList = styled(({ className='', id, offset = 0, data, placeholder, ...props }) => {
  return <div className={className + ' DragDroppableList'} {...props}>
    {data.map((item, index) => {
      return <Item key={item.id} id={item.id} index={index+offset}>{item.text}</Item>
    })}
    {placeholder}
  </div>
})`

`
const App = () => {
  const [list, setList] = useState([])
  const availableBlocks = [
    {
      text: 'text',
      id: 'text-block'
    },
    {
      text: 'image',
      id: 'image-block'
    }
  ]
  const [enabled] = useStrictDroppable(false);
  const onDragStart = (result) => {
    console.log('drag start', result)
  }
  const onDragEnd = (result) => {
    // todo 
    console.log('drag end draggableId:', result.draggableId, '\nsource:', result.source, '\ndestination:', result.destination)
    const { draggableId, source, destination } = result
   
    const offsetIndex = availableBlocks.length
    const id = uuidv4()
    let outItem = list[source.index - offsetIndex] || {
      text: '',
      id,
    }
    if(draggableId.endsWith('-block')){
      outItem = {
        id,
        text: 'this should be an image actually',
      }
      if(draggableId.startsWith('text')){
        outItem.text = 'This is a text block. Edit me.'
      }
      if(!destination){
        setList(list => ([...list, outItem]))
      } else {
        console.log('non-null destination')
        const droppedIndex = destination.index
        setList(list => {
          const outList = [...list]
          outList.splice(droppedIndex - offsetIndex + 1, 0, outItem)
          return outList
        })
      }
    } else {
      if(!destination) return
      if(destination.droppableId === source.droppableId &&
        destination.index === source.index){
        return 
      }

      setList(list => {
        const newList = [...list]
        newList.splice(source.index - offsetIndex, 1)
        newList.splice(destination.index - offsetIndex, 0, outItem)
        return newList
      })
    }
    
  }
  return <DragDropContext
  onDragStart={onDragStart}
    onDragEnd={onDragEnd}
  >
    {/*  */}
    {enabled && <Droppable droppableId='blocks'>{provided => (
      <>
      <DraggableList id='useable-blocks' data={availableBlocks} />
        <DropArea ref={provided.innerRef} {...provided.droppableProps}>
          <DragDroppableList
            id='used-blocks'
            data={list}
            offset={availableBlocks.length}
          />
          {provided.placeholder}
        </DropArea>
      </>
    )}</Droppable>}

  </DragDropContext>
}
function Home() {
  return (
    <div>
      <Head>
        <title>DND test</title>
        <meta name="description" content="Drag and drop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </div>
  )
}

Home.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () => originalRenderPage({
    enhanceApp: (App) => (props) => {
      resetServerContext();
      return <App {...props} />;
    },
  });
  return {}
}

export default Home
