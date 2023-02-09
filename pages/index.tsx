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

const DraggableItem = ({ children, id, index }) => {
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
      return <DraggableItem key={item.id} id={item.id} index={index}>{item.text}</DraggableItem>
    })}
  </div>
}


const DragDroppableList = styled(({ className='', id, offset = 0, items, setItems, placeholder, editorMode, ...props }) => {
  const typeToJsx = {
    text: (item, index) => {
      const Wrapper = editorMode ? DraggableItem : 'div'
      return (
        <Wrapper
          key={item.id}
          id={item.id}
          index={index+offset}
        >
          {editorMode ? (
            <textarea
            value={item.text}
            onChange={e => {
              setItems((items) => {
                const newItems = [...items]
                newItems[index].text = e.target.value
                return newItems
              })
            }}
            />
          ) : (<pre>{item.text}</pre>)}
        </Wrapper>
      )
    }
  }
  return <div className={className + ' DragDroppableList'} {...props}>
    {items.map((item, index) => {
      return typeToJsx['text'](item, index)
    })}
    {placeholder}
  </div>
})`

`
const App = () => {
  const [editorMode, setEditorMode] = useState(false)
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
      if(draggableId.startsWith('image')){
        outItem.image = {
          src: '',
          alt: ''
        }
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
  return <>
  <button onClick={()=>setEditorMode(em => !em)}>{editorMode ? 'Preview' : 'Editor'}</button>
  <DragDropContext
  onDragStart={onDragStart}
    onDragEnd={onDragEnd}
  >
    {/*  */}
    {enabled && <Droppable droppableId='blocks'>{provided => (
      <>
      {editorMode && <DraggableList id='useable-blocks' data={availableBlocks} />}
        <DropArea ref={provided.innerRef} {...provided.droppableProps}>
          <DragDroppableList
            id='used-blocks'
            items={list}
            setItems={setList}
            offset={availableBlocks.length}
            editorMode={editorMode}
          />
          {provided.placeholder}
        </DropArea>
      </>
    )}</Droppable>}

  </DragDropContext>
  </>
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
