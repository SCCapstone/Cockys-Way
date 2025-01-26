import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import AddClassForm from '../../app/addClassForm';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-native-element-dropdown', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      Dropdown: ({ onChange, value }) => (
        <Text onPress={() => onChange({ label: 'Fall 2024', value: '202408' })}>
          Mocked Dropdown - Selected Value: {value}
        </Text>
      ),
    };
  });

describe('AddClassForm', () => {
  it('navigates to AddClassSearchResults screen with correct parameters on button press', () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    // render the component
    const { getByText, getByPlaceholderText } = render(<AddClassForm />);

    // get the dropdown by its initial text
    const dropdown = getByText('Mocked Dropdown - Selected Value: ');
    fireEvent.press(dropdown);

    // get the other inputs and change their text as if a user was searching for a class
    const subjectInput = getByPlaceholderText('Subject');
    fireEvent.changeText(subjectInput, 'CSCE');

    const courseNumberInput = getByPlaceholderText('Course Number');
    fireEvent.changeText(courseNumberInput, '101');

    // press the search for classes button
    const button = getByText('Search For Classes');
    fireEvent.press(button);

    // validate the navigation
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/addClassSearchResults',
      params: { semester: '202408', subject: 'CSCE', number: '101' },
    });
  });
});