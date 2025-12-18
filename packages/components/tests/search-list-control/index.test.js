/**
 * External dependencies
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Internal dependencies
 */
import SearchListControl from '../../src/search-list-control'

describe('SearchListControl', () => {

  const defaultItems = [
    { id: '1', name: 'Apple', type: 'fruit' },
    { id: '2', name: 'Banana', type: 'fruit' },
    { id: '3', name: 'Carrot', type: 'vegetable' },
    { id: '4', name: 'Date', type: 'fruit' },
  ]

  const defaultProps = {

    isLoading: false,
    placeholder: 'Search...',

    items: defaultItems,
    itemKeyName: 'id',
    itemValueName: ['name'],
    itemFilterName: ['name'],
    onSelect: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
  }

  describe('rendering', () => {
    it('should render input element', () => {
      render(<SearchListControl {...defaultProps} />)

      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<SearchListControl {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('should hide search box when hideSearchBox is true', () => {
      render(<SearchListControl {...defaultProps} hideSearchBox={true} />)

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('should render all items', () => {
      render(<SearchListControl {...defaultProps} />)

      defaultItems.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument()
      })
    })

    it('should render with custom placeholder', () => {
      const placeholder = 'Search products...'
      render(<SearchListControl {...defaultProps} placeholder={placeholder} />)

      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
    })

    it('should show no items found text when items array is empty', () => {
      const noItemsText = 'No items found'
      render(
        <SearchListControl
          {...defaultProps}
          items={[]}
          noItemsFoundText={noItemsText}
        />,
      )

      expect(screen.getByText(noItemsText)).toBeInTheDocument()
    })

    it('should display spinner when isLoading is true', () => {

      const { container } = render(<SearchListControl {...defaultProps} isLoading={true} />)

      const element = container.querySelector('.components-spinner')
      expect(element).toBeInTheDocument()

    })

    it('should render radio buttons by default (single select)', () => {
      render(<SearchListControl {...defaultProps} />)

      const radioInputs = screen.getAllByRole('radio')
      expect(radioInputs).toHaveLength(defaultItems.length)
    })

    it('should render checkboxes when isMultiSelect is true', () => {
      render(<SearchListControl {...defaultProps} isMultiSelect={true} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(defaultItems.length)
    })

    it('should call onSelect when an item is selected', async () => {
      const onSelect = jest.fn()
      const user = userEvent.setup()

      render(<SearchListControl {...defaultProps} onSelect={onSelect} />)

      const radioInputs = screen.getAllByRole('radio')
      await user.click(radioInputs[0])

      expect(onSelect).toHaveBeenCalled()

    })

    it('should allow multiple selections in multi-select mode', async () => {
      const onSelect = jest.fn()
      const user = userEvent.setup()

      render(
        <SearchListControl
          {...defaultProps}
          isMultiSelect={true}
          onSelect={onSelect}
        />,
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[0])
      await user.click(checkboxes[1])

      expect(onSelect).toHaveBeenLastCalledWith(
        expect.arrayContaining(['1', '2']),
        expect.any(Array),
      )

    })

    it('should call onSearch when typing in search input', async () => {
      const onSearch = jest.fn()
      const user = userEvent.setup()

      render(<SearchListControl {...defaultProps} onSearch={onSearch} />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'Apple')

      expect(onSearch).toHaveBeenCalledWith('Apple')

    })

    it('should show no items found when search has no matches', async () => {
      const noItemsText = 'No items found'
      const user = userEvent.setup()

      render(
        <SearchListControl
          {...defaultProps}
          noItemsFoundText={noItemsText}
        />,
      )

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'xyz123')

      expect(screen.getByText(noItemsText)).toBeInTheDocument()

    })

    it('should filter using custom itemFilterName keys', async () => {

      const user = userEvent.setup()

      render(
        <SearchListControl
          {...defaultProps}
          itemFilterName={['type']}
        />,
      )

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'vegetable')

      expect(screen.getByText('Carrot')).toBeInTheDocument()
      expect(screen.queryByText('Apple')).not.toBeInTheDocument()
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()

    })

    it('should display item meta when itemMetaName is provided', () => {
      render(
        <SearchListControl
          {...defaultProps}
          itemMetaName={['type']}
        />,
      )

      expect(screen.getAllByText('fruit')).toHaveLength(3)
      expect(screen.getAllByText('vegetable')).toHaveLength(1)
    })

    it('should join multiple meta values with separator', () => {
      const itemsWithMultipleMeta = [
        { id: '1', name: 'Item 1', category: 'Cat A', status: 'Active' },
      ]

      render(
        <SearchListControl
          {...defaultProps}
          items={itemsWithMultipleMeta}
          itemMetaName={['category', 'status']}
          itemMetaNameSeparator=" | "
        />,
      )

      expect(screen.getByText('Cat A | Active')).toBeInTheDocument()
    })

    it('should join multiple value keys with separator', () => {
      const itemsWithMultipleValues = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
      ]

      render(
        <SearchListControl
          {...defaultProps}
          items={itemsWithMultipleValues}
          itemValueName={['firstName', 'lastName']}
          itemValueNameSeparator=" - "
        />,
      )

      expect(screen.getByText('John - Doe')).toBeInTheDocument()
    })

    it('should access nested object values using dot notation', () => {
      const nestedItems = [
        { id: '1', title: { rendered: 'Post Title' } },
      ]

      render(
        <SearchListControl
          {...defaultProps}
          items={nestedItems}
          itemValueName={['title.rendered']}
        />,
      )

      expect(screen.getByText('Post Title')).toBeInTheDocument()
    })

    it('should have proper input types', () => {
      render(<SearchListControl {...defaultProps} />)

      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toHaveAttribute('type', 'search')
      expect(searchInput).toHaveAttribute('autocomplete', 'off')
    })

  })

})
