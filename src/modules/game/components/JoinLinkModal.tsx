import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import tw from 'twin.macro'
import useOnClickOutside from '../../../shared/hooks/useOnClickOutside'

interface JoinLinkModalProps {
  toggleModal: () => void
  isOpen: boolean
}

export default function JoinLinkModal ({ toggleModal, isOpen }: JoinLinkModalProps) {
  const modalRef = useRef(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const params = useParams()

  useOnClickOutside(modalRef, () => {
    toggleModal()
    setLinkCopied(false)
  })

  async function copyToClipboard () {
    try {
      await navigator.clipboard.writeText(`${location.origin}/rooms/${params.id}/${params.code}`)
      setLinkCopied(true)
    } catch (err) {}
  }

  return (
    <>
      <Backdrop />
      <Modal ref={modalRef} open={isOpen}>
        <Title>Join code</Title>

        <ModalBody>
          <JoinLinkInput type="text" disabled value={params.code} />
          {linkCopied && (
            <SuccessMessage>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Link copied
            </SuccessMessage>
          )}
          <CopyButton onClick={copyToClipboard}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>

            Copy join link
          </CopyButton>
        </ModalBody>
      </Modal>
    </>
  )
}

const Backdrop = tw.div`
  fixed
  top-0
  left-0
  right-0
  bottom-0
  backdrop-blur-lg
  backdrop-brightness-50
  z-10
`

const Modal = tw.dialog`
  w-90vw
  max-w-lg
  bg-white
  rounded-lg
  p-4
  fixed
  top-1/2
  left-0
  right-0
  mx-auto
  -translate-y-1/2
  shadow-2xl
  text-left
  z-10
`

const Title = tw.h2`
  font-bold
  text-xl
  mb-4
  border-b
  pb-4
`

const ModalBody = tw.section`
  grid
  gap-4
  mb-4
`

const JoinLinkInput = tw.input`
  rounded-xl
  w-full
  py-4
  text-center
  font-black
  text-2xl
  border-neutral-300
`

const CopyButton = tw.button`
  inline-flex
  items-center
  justify-center
  rounded-lg
  bg-violet-500
  border
  border-solid
  border-violet-600
  px-10
  pl-6
  py-4
  text-lg
  font-bold
  text-violet-50
  transition-all
  active:bg-violet-700
`

const SuccessMessage = tw.span`
  text-emerald-400
  inline-flex
  items-center
`