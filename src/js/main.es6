const BASE_URL = 'https://jsonplaceholder.typicode.com';

const getTodos = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/todos`);

        const todos = res.data;

        console.log(`GET: Here's the list of todos`, todos);

        return todos;
    } catch (e) {
        console.error(e);
    }
};

getTodos()