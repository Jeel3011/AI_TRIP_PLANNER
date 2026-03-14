from utils.model_loader import ModalLoader
from tools.weather_info_tool import WeatherInfoTool
from tools.place_search_tool import PlaceSearchTool
from tools.expense_calculator_tool import CalculatorTool
from tools.currency_conversion_tool import CurrencyConversionTool
from prompt_library.prompt import SYSTEM_PROMPT
from langgraph.graph import StateGraph,START,END,MessagesState
from langgraph.prebuilt import ToolNode,tools_condition




class GraphBuilder:
    def __init__(self,model_prvider:str = "groq"):

        self.model_loader = ModalLoader()
        self.llm = self.model_loader.load_llm()

        self.tools = []
        self.weather_tool = WeatherInfoTool()
        self.place_search_tool = PlaceSearchTool()
        self.calculator_tool = CalculatorTool()
        self.currency_conversion_tool = CurrencyConversionTool()

        self.tools.extend([*self.weather_tool,
                           *self.place_search_tool,
                           *self.calculator_tool,
                           *self.currency_conversion_tool])
        
        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)

        self.graph = None
        
        self.system_prompt = SYSTEM_PROMPT

        

    def agent_function(self,state: MessagesState):
        """Main agent function"""
        user_question = state["messages"]
        input_question = [self.system_prompt] + user_question
        response = self.llm_with_tools.invoke(input_question)
        return {"messages": [response]}

    def build_graph(self):
        graph_builder=StateGraph(MessagesState)
        graph_builder.add_node("agent", self.agent_function)
        graph_builder.add_node("tools", ToolNode(tools=self.tools))
        graph_builder.add_edge(START,"agent")
        graph_builder.add_conditional_edges("agent",tools_condition)
        graph_builder.add_edge("tools","agent")
        graph_builder.add_edge("agent",END)
        
        self.graph = graph_builder.compile()
        return self.graph

    def __call__(self):
       return self.build_graph()
    