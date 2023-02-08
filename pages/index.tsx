import Head from 'next/head'
import { useState, forwardRef } from 'react'
import { DragDropContext, Draggable, Droppable, resetServerContext } from 'react-beautiful-dnd'
import styled from 'styled-components'
import useStrictDroppable from '../hooks/useStrictDroppable'

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
  const [list, setList] = useState([
    {
      text: 'hello there',
      id: 'a'
    },
    {
      text: 'adadad',
      id: 'b'
    },
    {
      text: 'merhaba',
      id: 'c'
    }
  ])
  const availableBlocks = [
    {
      text: 'text',
      id: 'text'
    },
    {
      text: 'image',
      id: 'image'
    }
  ]
  const [enabled] = useStrictDroppable(false);
  const onDragStart = (result) => {
    console.log('drag start', result)
  }
  const onDragEnd = (result) => {
    // todo 
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
